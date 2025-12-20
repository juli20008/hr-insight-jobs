import React from 'react';
import { Job } from '../types';

interface JobCardProps {
  job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  // 📅 智能日期修复器
  const formatDate = (dateStr: string | null | undefined) => {
    // 1. 如果日期是空的，说明是最新抓取的（防止 1970 Bug）
    if (!dateStr) return 'Recently';

    try {
      const date = new Date(dateStr);
      const now = new Date();
      
      // 2. 如果日期无效，或者年份小于 2024 (绝对是 Bug)，强制显示 Recently
      if (isNaN(date.getTime()) || date.getFullYear() < 2024) {
        return 'Recently';
      }

      // 计算时间差
      const diffTime = date.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // 3. 如果是今天或未来
      if (diffDays >= 0) return 'Today';
      
      // 4. 正常显示天数
      const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
      return rtf.format(diffDays, 'day');
      
    } catch {
      return 'Recently';
    }
  };

  const location = [job.job_city, job.job_state, job.job_country]
    .filter(Boolean)
    .join(', ') || 'Remote / USA';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 hover:shadow-xl transition-all duration-300 group flex flex-col h-full hover:-translate-y-1">
      <div className="flex items-start gap-5 mb-6">
        {/* Logo */}
        <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden border border-slate-100 shrink-0 p-2">
          {job.employer_logo ? (
            <img 
              src={job.employer_logo} 
              alt={job.employer_name} 
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).parentElement!.innerText = job.employer_name.charAt(0);
              }}
            />
          ) : (
            <span className="text-2xl font-black text-slate-300 select-none">{job.employer_name.charAt(0)}</span>
          )}
        </div>
        
        {/* 标题 & 公司 */}
        <div>
          <h3 className="text-xl font-bold text-slate-900 leading-tight mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {job.job_title}
          </h3>
          <p className="text-slate-500 font-bold text-sm">{job.employer_name}</p>
        </div>
      </div>

      {/* 标签 */}
      <div className="space-y-3 mb-8 flex-grow">
        <div className="flex items-center text-sm font-medium text-slate-600 bg-slate-50 py-2 px-3 rounded-lg w-fit">
          📍 {location}
        </div>
        <div className="flex items-center text-sm font-medium text-slate-600 bg-slate-50 py-2 px-3 rounded-lg w-fit">
          {/* 这里会把 20441 days 变成 Recently */}
          🕒 Posted {formatDate(job.job_posted_at_datetime_utc)}
        </div>
      </div>

      <a
        href={job.job_apply_link}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-center transition-colors flex items-center justify-center gap-2 mt-auto"
      >
        Apply Now
      </a>
    </div>
  );
};

export default JobCard;