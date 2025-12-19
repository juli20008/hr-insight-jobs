import React, { useState, useEffect } from 'react';
import { ScrapedData, Job } from './types';
import JobCard from './components/JobCard';

const App: React.FC = () => {
  const [data, setData] = useState<ScrapedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // 添加一个时间戳参数防止缓存
        const response = await fetch(`/jobs.json?t=${new Date().getTime()}`);
        if (!response.ok) {
          throw new Error('Waiting for data... (Please run the scraper)');
        }
        const json = await response.json();
        setData(json);
      } catch (err: any) {
        console.error("Fetch error:", err);
        // 如果是解析错误，说明文件可能为空或损坏
        if (err.name === 'SyntaxError') {
           setError('Data file is empty or corrupted. Please wait for the next scrape.');
        } else {
           setError(err.message);
        }
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
    <div className="min-h-screen bg-slate-50 font-inter flex flex-col">
      {/* Header Section */}
      <header className="bg-slate-900 text-white py-16 px-4 shadow-2xl relative overflow-hidden">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
            HR <span className="text-blue-400">Insight</span> Jobs
          </h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Curated opportunities for HR Data Analysts and HR Technology specialists in the USA.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <input
              type="text"
              placeholder="Search by title or company..."
              className="w-full py-4 px-6 pr-14 rounded-full bg-white/95 text-slate-900 placeholder-slate-400 border-2 border-transparent focus:border-blue-400 focus:ring-4 focus:ring-blue-500/30 transition-all shadow-xl outline-none text-lg font-medium backdrop-blur-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12 flex-grow w-full">
        {/* Status Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Latest Openings</h2>
            {data && (
               <p className="text-sm text-slate-500 font-medium flex items-center italic">
                 Last updated: {new Date(data.last_updated).toLocaleString()}
               </p>
            )}
          </div>
          {/* Job Count Badge - Changed to Blue */}
          <span className="inline-flex items-center bg-blue-50 text-blue-700 px-5 py-2.5 rounded-full text-sm font-bold border border-blue-100 shadow-sm whitespace-nowrap">
            {filteredJobs.length} {filteredJobs.length === 1 ? 'Role' : 'Roles'} Available
          </span>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium text-lg animate-pulse">Fetching latest opportunities...</p>
          </div>
        ) : error ? (
          // Error State
          <div className="max-w-2xl mx-auto bg-rose-50 border border-rose-200 p-10 rounded-3xl text-center shadow-sm">
            <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-rose-900 mb-3">System Notice</h3>
            <p className="text-rose-700 font-medium mb-6">{error}</p>
            <p className="text-rose-500 text-sm bg-white/50 py-3 px-4 rounded-xl inline-block">
              If this is a new repository, please wait for the first daily scrape to complete or trigger it manually in GitHub Actions.
            </p>
          </div>
        ) : (
          // Job Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job: Job) => (
                <JobCard key={job.job_id} job={job} />
              ))
            ) : (
              // Empty State
              <div className="col-span-full py-32 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-20 h-20 mx-auto text-slate-300 mb-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <p className="text-slate-500 text-xl font-medium mb-4">No roles match your search.</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-blue-600 font-bold hover:text-blue-700 hover:underline transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 px-4 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between text-slate-500 text-sm gap-6">
          <p className="font-medium">© {new Date().getFullYear()} HR Insight. All job data is processed via automated Git-scraping.</p>
          <div className="flex gap-8 font-bold">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors flex items-center gap-2">
              <span>GitHub Repo</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h9.5A2.25 2.25 0 0117 4.25v11.5a2.25 2.25 0 01-2.25 2.25h-9.5A2.25 2.25 0 013 15.75V4.25zM6 13a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1-3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;