import requests
import json
import os
from datetime import datetime

# 1. 验证 API Key
api_key = os.environ.get("RAPIDAPI_KEY")
# 本地测试时，你可以临时把这行取消注释填入 Key，提交代码前记得删掉！
# api_key = "YOUR_TEST_KEY_HERE" 

if not api_key:
    # 为了防止 GitHub Action 报错，如果没 Key 可以打印警告并退出，或者抛出异常
    print("Warning: RAPIDAPI_KEY is missing. Skipping scrape.")
    exit(0)

# 2. 配置请求
url = "https://jsearch.p.rapidapi.com/search"
querystring = {
    "query": "HR Data Analyst OR HR Technology in USA",
    "page": "1",
    "num_pages": "1", 
    "date_posted": "3days"
}

headers = {
    "X-RapidAPI-Key": api_key,
    "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
}

try:
    print(f"Fetching jobs for query: {querystring['query']}...")
    response = requests.get(url, headers=headers, params=querystring)
    response.raise_for_status()
    
    data = response.json()
    jobs = data.get('data', [])
    print(f"Found {len(jobs)} raw jobs.")

    # 3. 数据清洗
    clean_jobs = []
    for job in jobs:
        # 确保有 job_id，如果没有就用链接做 ID
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

    # 4. 构建最终数据
    final_data = {
        "last_updated": datetime.utcnow().isoformat(),
        "jobs": clean_jobs
    }

    # 5. 保存到 PUBLIC 文件夹 (Vite 关键步骤)
    os.makedirs('public', exist_ok=True)
    
    with open('public/jobs.json', 'w', encoding='utf-8') as f:
        json.dump(final_data, f, ensure_ascii=False, indent=2)
    
    print(f"Successfully saved {len(clean_jobs)} jobs to public/jobs.json")

except Exception as e:
    print(f"Error occurred: {e}")
    exit(1)