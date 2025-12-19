import React from 'react';
import { Job } from '../types';

interface JobCardProps {
  job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  // 智能日期格式化函数
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'Recently';

    try {
      const date = new Date(dateStr);
      const now = new Date();
      
      // 检查无效日期或过于久远的日期 (例如 Unix纪元错误)
      if (isNaN(date.getTime()) || date.getFullYear() < 2020) {
        return 'Recently';
      }

      const diffTime = date.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // 如果是未来时间或今天
      if (diffDays >= 0) {
        return 'Today';
      }
      
      // 使用相对时间格式化 (例如 "3 days ago")
      const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
      return rtf.format(diffDays, 'day');
      
    } catch {
      return 'Recently';
    }
  };

  // 格式化地点
  const location = [job.job_city, job.job_state, job.job_country]
    .filter(Boolean)
    .join(', ') || 'Remote / USA';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 hover:shadow-xl transition-all duration-300 group flex flex-col h-full hover:-translate-y-1">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-5">
          {/* Logo Box */}
          <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden border border-slate-100 shrink-0 p-2shadow-sm">
            {job.employer_logo ? (
              <img 
                src={job.employer_logo} 
                alt={job.employer_name} 
                className="w-full h-full object-contain"
                onError={(e) => {
                  // 图片加载失败时回退到首字母
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = `<span class="text-2xl font-black text-slate-300 select-none">${job.employer_name.charAt(0)}</span>`;
                }}
              />
            ) : (
              <span className="text-2xl font-black text-slate-300 select-none">{job.employer_name.charAt(0)}</span>
            )}
          </div>
          
          {/* Title & Company */}
          <div>
            <h3 className="text-xl font-bold text-slate-900 leading-tight mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {job.job_title}
            </h3>
            <p className="text-slate-500 font-bold text-sm">{job.employer_name}</p>
          </div>
        </div>
      </div>

      {/* Metadata tags */}
      <div className="space-y-3 mb-8 flex-grow">
        <div className="flex items-center text-sm font-medium text-slate-600 bg-slate-50 py-2 px-3 rounded-lg w-fit">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-2 text-slate-400">
            <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308.066l.002-.001.006.003.018.008a5.741 5.741 0 00.281.14c.186.096.446.24.757.433.62.384 1.445.966 2.27 1.765C15.302 22.836 18 24.726 18 27V10a2 2 0 00-2-2H4a2 2 0 00-2 2v17c0-2.274 2.698-4.164 4.366-5.593.825-.799 1.65-1.38 2.27-1.765.311-.193.57-.337.757-.433a5.741 5.741 0 00.299-.148l.006-.003.002-.001zM3 27a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
            <path d="M10 0a2 2 0 100 4 2 2 0 000-4z"/>
          </svg>
          {location}
        </div>
        <div className="flex items-center text-sm font-medium text-slate-600 bg-slate-50 py-2 px-3 rounded-lg w-fit">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-2 text-slate-400">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
          </svg>
          Posted {formatDate(job.job_posted_at_datetime_utc)}
        </div>
      </div>

      {/* Apply Button - Changed to Blue */}
      <a
        href={job.job_apply_link}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-center transition-colors flex items-center justify-center gap-2 group/btn shadow-sm hover:shadow-md hover:-translate-y-0.5 mt-auto"
      >
        Apply Now
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 transition-transform group-hover/btn:translate-x-1">
          <path fillRule="evenodd" d="M5 10a.75.75 0 01.75-.75h6.638L10.23 7.29a.75.75 0 111.04-1.08l3.5 3.5a.75.75 0 010 1.08l-3.5 3.5a.75.75 0 11-1.04-1.08l2.158-1.96H5.75A.75.75 0 015 10z" clipRule="evenodd" />
        </svg>
      </a>
    </div>
  );
};

export default JobCard;