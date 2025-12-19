import requests
import json
import os
from datetime import datetime

# ==========================================
# 1. 配置与密钥 (Configuration)
# ==========================================

api_key = os.environ.get("RAPIDAPI_KEY")

# 🚨 本地测试时打开这行，提交前注释掉！
# api_key = "你的_RAPIDAPI_KEY"

if not api_key:
    print("❌ Error: RAPIDAPI_KEY is missing.")
    exit(1)

url = "https://jsearch.p.rapidapi.com/search"

# ==========================================
# 2. 搜索策略 (从你的列表中提取的核心关键词)
# ==========================================

# 我从你提供的 100+ 个职位中提取了以下核心高频词，并用 OR 连接
# 这样一次 API 调用就能覆盖所有这些细分领域，极度节省额度。

search_term = """
(
"People Analyst" OR "HR Data Analyst" OR "People Data Analyst" OR 
"Workforce Analytics" OR "Workforce Planning Analyst" OR 
"HRIS Analyst" OR "HR Systems Analyst" OR "HR Tech Analyst" OR "Workday Analyst" OR 
"Compensation Analyst" OR "Total Rewards Analyst" OR 
"Talent Analytics" OR "Talent Insights" OR "Recruiting Data Analyst" OR 
"People Operations Analyst" OR "Employee Experience Analyst"
)
"""

# 去掉换行符，变成一行
search_term = search_term.replace('\n', ' ').strip()

querystring = {
    # 核心逻辑：(核心职位) AND (在美国 OR 加拿大) AND (远程 OR 混合)
    "query": f"{search_term} in USA OR Canada (Remote OR Hybrid)", 
    "page": "1",
    "num_pages": "10", 
    "date_posted": "3days",   
    "employment_types": "fulltime" 
}

headers = {
    "X-RapidAPI-Key": api_key,
    "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
}

# ==========================================
# 3. 执行抓取与清洗
# ==========================================

try:
    print(f"🔍 Fetching jobs...")
    response = requests.get(url, headers=headers, params=querystring)
    response.raise_for_status()
    
    data = response.json()
    raw_jobs = data.get('data', [])
    print(f"📦 API returned {len(raw_jobs)} raw jobs.")

    clean_jobs = []
    
    # 垃圾词黑名单 (根据你的列表优化，排除掉纯 Recruiting 或 Sales 岗)
    exclude_keywords = [
        "recruiter", "talent acquisition partner", "coordinator", "assistant", 
        "intern", "sales", "account executive", "business development"
    ]

    for job in raw_jobs:
        title = job.get("job_title", "").lower()
        
        # 1. 垃圾词过滤
        if any(keyword in title for keyword in exclude_keywords):
            continue 
            
        # 2. ID 校验
        job_id = job.get("job_id") or job.get("job_apply_link")
        
        if job_id: 
            clean_jobs.append({
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

    # ==========================================
    # 4. 保存数据
    # ==========================================

    final_data = {
        "last_updated": datetime.utcnow().isoformat(),
        "total_jobs": len(clean_jobs),
        "jobs": clean_jobs
    }

    os.makedirs('public', exist_ok=True)
    
    with open('public/jobs.json', 'w', encoding='utf-8') as f:
        json.dump(final_data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Success! Saved {len(clean_jobs)} clean jobs to public/jobs.json")

except Exception as e:
    print(f"❌ Error occurred: {e}")
    exit(1)