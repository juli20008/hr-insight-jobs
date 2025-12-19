export interface Job {
  job_id: string;
  job_title: string;
  employer_name: string;
  employer_logo?: string;
  job_city?: string;
  job_state?: string;
  job_country?: string;
  job_apply_link: string;
  job_posted_at_datetime_utc: string;
}

export interface ScrapedData {
  last_updated: string;
  jobs: Job[];
}