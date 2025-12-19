import React from 'react';
import { Job } from '../types';

interface JobCardProps {
  job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const diffDays = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
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
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 group flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden border border-slate-100 shrink-0">
            {job.employer_logo ? (
              <img 
                src={job.employer_logo} 
                alt={job.employer_name} 
                className="w-full h-full object-contain p-1"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.innerText = job.employer_name.charAt(0);
                }}
              />
            ) : (
              <span className="text-xl font-bold text-slate-400">{job.employer_name.charAt(0)}</span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
              {job.job_title}
            </h3>
            <p className="text-sm text-slate-500 font-medium">{job.employer_name}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6 flex-grow">
        <div className="flex items-center text-sm text-slate-600">
          <span className="mr-2">📍</span> {location}
        </div>
        <div className="flex items-center text-sm text-slate-600">
          <span className="mr-2">🕒</span> Posted {formatDate(job.job_posted_at_datetime_utc)}
        </div>
      </div>

      <a
        href={job.job_apply_link}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-center transition-colors block"
      >
        Apply Now
      </a>
    </div>
  );
};

export default JobCard;