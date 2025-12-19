import React, { useState, useEffect } from 'react';
import { ScrapedData } from './types';
import JobCard from './components/JobCard';

const App: React.FC = () => {
  const [data, setData] = useState<ScrapedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // ✅ 关键：使用绝对路径 /jobs.json 读取 public 文件夹内容
        const response = await fetch('/jobs.json');
        
        if (!response.ok) {
          // 如果是 404，说明爬虫还没运行过，给个友好提示
          throw new Error('Waiting for data... (Please run the scraper)');
        }
        
        const json = await response.json();
        setData(json);
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const filteredJobs = data?.jobs.filter(job => 
    job.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.employer_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white py-12 px-4 mb-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            HR <span className="text-indigo-400">Insight</span> Jobs
          </h1>
          <p className="text-slate-400 text-lg mb-8">
            Curated opportunities for HR Data Analysts & Tech
          </p>
          <div className="max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Search by title or company..."
              className="w-full py-4 px-6 rounded-full text-slate-900 shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/30"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Latest Openings</h2>
          {data && (
            <span className="text-sm text-slate-500">
              Updated: {new Date(data.last_updated).toLocaleDateString()}
            </span>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="text-indigo-600 text-xl font-medium animate-pulse">Loading jobs...</div>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 p-8 rounded-2xl text-center text-rose-700">
            <h3 className="font-bold mb-2">Notice</h3>
            <p>{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.length > 0 ? (
              filteredJobs.map(job => (
                <JobCard key={job.job_id} job={job} />
              ))
            ) : (
              <div className="col-span-full text-center py-20 text-slate-500">
                No matches found for "{searchTerm}"
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;