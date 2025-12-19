import requests
import json
import os
from datetime import datetime
import time

# ==========================================
# 1. 配置
# ==========================================
api_key = os.environ.get("RAPIDAPI_KEY")
# api_key = "你的_TEST_KEY" 

if not api_key:
    print("❌ Error: RAPIDAPI_KEY is missing.")
    exit(1)

url = "https://jsearch.p.rapidapi.com/search"

headers = {
    "X-RapidAPI-Key": api_key,
    "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
}

# ==========================================
# 2. 关键词分组 (完全照搬你的 LinkedIn 搜索词)
# ==========================================

# 为了防止 API 消化不良，我们将你的长列表拆分为 3 组
queries = [
    # 组 1: 核心分析
    '("People Analyst" OR "HR Data Analyst" OR "People Data Analyst" OR "Workforce Analytics" OR "Workforce Planning Analyst")',
    
    # 组 2: 系统与技术
    '("HRIS Analyst" OR "HR Systems Analyst" OR "HR Tech Analyst" OR "Workday Analyst" OR "People Operations Analyst")',
    
    # 组 3: 薪酬与体验
    '("Compensation Analyst" OR "Total Rewards Analyst" OR "Talent Analytics" OR "Talent Insights" OR "Recruiting Data Analyst" OR "Employee Experience Analyst")'
]

# ==========================================
# 3. 执行抓取
# ==========================================

all_clean_jobs = []
seen_job_ids = set() 

print(f"🚀 Starting California-specific scrape...")

for q in queries:
    # ⚠️ 关键修改：地点改为 California, USA
    query_string = f"{q} in California, USA"
    
    params = {
        "query": query_string,
        "page": "1",
        "num_pages": "5",       # 每个组抓5页
        "date_posted": "3days", # 依然建议用 3days，因为 API 的时效性比 LinkedIn 稍微滞后一点点
        "employment_types": "fulltime"
    }

    try:
        print(f"   🔎 Searching in CA: {q[:30]}...")
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        
        data = response.json()
        raw_jobs = data.get('data', [])
        print(f"      📦 Found {len(raw_jobs)} raw jobs.")
        
        # 垃圾词黑名单
        exclude_keywords = [
            "recruiter", "talent acquisition partner", "coordinator", "assistant", 
            "intern", "sales", "manager of", "head of", "director"
        ]

        for job in raw_jobs:
            title = job.get("job_title", "").lower()
            
            # 1. 垃圾词过滤
            if any(keyword in title for keyword in exclude_keywords):
                continue 
                
            # 2. 生成 ID
            job_id = job.get("job_id") or job.get("job_apply_link")
            
            # 3. 去重
            if job_id and job_id not in seen_job_ids:
                seen_job_ids.add(job_id)
                
                all_clean_jobs.append({
                    "job_id": job_id,
                    "job_title": job.get("job_title"),
                    "employer_name": job.get("employer_name"),
                    "employer_logo": job.get("employer_logo"),
                    "job_city": job.get("job_city"),
                    "job_state": job.get("job_state"),
                    "job_country": job.get("job_country"),
                    "job_apply_link": job.get("job_apply_link"),
                    "job_posted_at_datetime_utc": job.get("job_posted_at_datetime_utc")
                })
        
        time.sleep(1)

    except Exception as e:
        print(f"      ⚠️ Error fetching query: {e}")
        continue

# ==========================================
# 4. 保存
# ==========================================

print(f"🎉 Total unique CA jobs: {len(all_clean_jobs)}")

final_data = {
    "last_updated": datetime.utcnow().isoformat(),
    "total_jobs": len(all_clean_jobs),
    "jobs": all_clean_jobs
}

os.makedirs('public', exist_ok=True)

with open('public/jobs.json', 'w', encoding='utf-8') as f:
    json.dump(final_data, f, ensure_ascii=False, indent=2)

print(f"✅ Saved to public/jobs.json")