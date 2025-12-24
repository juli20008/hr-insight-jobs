import requests
import json
import os
from datetime import datetime
import time

# ==========================================
# 1. 配置 (Configuration)
# ==========================================
api_key = os.environ.get("RAPIDAPI_KEY")

# 🚨 本地测试时取消注释下面这行填入 Key，提交代码前记得注释掉！
# api_key = "你的_RAPIDAPI_KEY"

if not api_key:
    print("❌ Error: RAPIDAPI_KEY is missing.")
    exit(1)

url = "https://jsearch.p.rapidapi.com/search"

headers = {
    "X-RapidAPI-Key": api_key,
    "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
}

# ==========================================
# 2. 搜索战队 (关键词分组策略)
# ==========================================
# 你提供的 16 个关键词太长了，一次搜不完。
# 我们把它们按“职能”拆分成 3 组，确保每个职位都能被抓到。

queries = [
    # 战队 A: 数据与规划 (Data & Planning)
    '("People Analyst" OR "HR Data Analyst" OR "People Data Analyst" OR "Workforce Analytics" OR "Workforce Planning Analyst")',
    
    # 战队 B: 系统与技术 (Systems & Tech)
    '("HRIS Analyst" OR "HR Systems Analyst" OR "HR Tech Analyst" OR "Workday Analyst" OR "People Operations Analyst")',
    
    # 战队 C: 薪酬、人才与体验 (Comp, Talent & Experience)
    '("Compensation Analyst" OR "Total Rewards Analyst" OR "Talent Analytics" OR "Talent Insight" OR "Recruiting Data Analyst" OR "Employee Experience Analyst")'
]

# ==========================================
# 3. 执行抓取 (Execution)
# ==========================================

all_clean_jobs = []
seen_job_ids = set() 

print(f"🚀 Starting scrape for: California, Past 24 Hours...")

for q in queries:
    # 📍 核心修改：精准锁定加州
    query_string = f"{q} in California, USA"
    
    params = {
        "query": query_string,
        "page": "1",
        "num_pages": "10",       # 每个战队抓 10 页 (保证覆盖量)
        "date_posted": "today", # 🕒 核心修改：只抓今天 (Past 24h)
        "employment_types": "fulltime"
    }

    try:
        print(f"   🔎 Searching: {q[:40]}...")
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        
        data = response.json()
        raw_jobs = data.get('data', [])
        print(f"      📦 Found {len(raw_jobs)} raw jobs.")
        
        # 垃圾词黑名单 (排除非 Analyst 职位)
        exclude_keywords = [
            "recruiter", "talent acquisition partner", "coordinator", "assistant", 
            "intern", "sales", "account executive", "business development", 
            "manager of", "director", "vp", "head of"
        ]

        for job in raw_jobs:
            title = job.get("job_title", "").lower()
            
            # 1. 垃圾词过滤
            if any(keyword in title for keyword in exclude_keywords):
                continue 
                
            # 2. 生成 ID
            job_id = job.get("job_id") or job.get("job_apply_link")
            
 # 3. 去重 (防止战队 A 和 B 抓到同一个)
            if job_id and job_id not in seen_job_ids:
                seen_job_ids.add(job_id)
                
                # ==========================================
                # 🛠️ FIX BUG (FINAL): 针对多伦多时区彻底修复
                # ==========================================
                posted_date = job.get("job_posted_at_datetime_utc")
                
                # 如果 API 没给日期 (Null)，我们手动生成一个
                if not posted_date:
                    # 1. 获取当前 UTC 时间
                    now_utc = datetime.utcnow()
                    
                    # 2. 核心修复：手动添加 'Z'，告诉浏览器这是 UTC 时间
                    # 浏览器看到 'Z' 后，会把 03:45 (UTC) 自动转换成多伦多的 22:45 (昨晚/今天)
                    posted_date = now_utc.isoformat() + 'Z'

                # ==========================================
                # END FIX
                # ==========================================

                all_clean_jobs.append({
                    "job_id": job_id,
                    "job_title": job.get("job_title"),
                    "employer_name": job.get("employer_name"),
                    "employer_logo": job.get("employer_logo"),
                    "job_city": job.get("job_city"),
                    "job_state": job.get("job_state"),
                    "job_country": job.get("job_country"),
                    "job_apply_link": job.get("job_apply_link"),
                    "job_posted_at_datetime_utc": posted_date 
                })
        
        # 休息 1 秒，对 API 温柔一点
        time.sleep(1)

    except Exception as e:
        print(f"      ⚠️ Error fetching query: {e}")
        continue

# ==========================================
# 4. 保存数据 (Save)
# ==========================================

print(f"🎉 Total unique CA jobs found: {len(all_clean_jobs)}")

final_data = {
    "last_updated": datetime.utcnow().isoformat(),
    "total_jobs": len(all_clean_jobs),
    "jobs": all_clean_jobs
}

os.makedirs('public', exist_ok=True)

with open('public/jobs.json', 'w', encoding='utf-8') as f:
    json.dump(final_data, f, ensure_ascii=False, indent=2)

print(f"✅ Saved to public/jobs.json")