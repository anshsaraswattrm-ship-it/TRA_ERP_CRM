import { useState, useEffect } from 'react';
import { Target, TrendingUp, Trophy, Flame, Medal, Award, Search, Users } from 'lucide-react';

// --- COMPETITIVE MOCK DATABASE ---
const bdePerformanceData = [
  { id: 'EMP-001', name: 'Vishal Sharma', role: 'BDE', tl: 'Neha Gupta', manager: 'Rajeev Singh', target: 20, achieved: 22 },
  { id: 'EMP-002', name: 'Aman Verma', role: 'BDE', tl: 'Neha Gupta', manager: 'Rajeev Singh', target: 20, achieved: 14 },
  { id: 'EMP-003', name: 'Priya Desai', role: 'BDE', tl: 'Vikram Malhotra', manager: 'Rajeev Singh', target: 15, achieved: 12 },
  { id: 'EMP-004', name: 'Rohan Kapoor', role: 'BDE', tl: 'Vikram Malhotra', manager: 'Arun Bajaj', target: 25, achieved: 8 },
  { id: 'EMP-005', name: 'Sneha Rao', role: 'BDE', tl: 'Neha Gupta', manager: 'Arun Bajaj', target: 20, achieved: 19 },
  { id: 'EMP-006', name: 'Karan Singh', role: 'BDE', tl: 'Vikram Malhotra', manager: 'Rajeev Singh', target: 15, achieved: 2 },
];

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [animateBars, setAnimateBars] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimateBars(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const sortedData = [...bdePerformanceData].sort((a, b) => {
    const aPercent = (a.achieved / a.target) * 100;
    const bPercent = (b.achieved / b.target) * 100;
    return bPercent - aPercent;
  });

  const filteredData = sortedData.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.tl.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.manager.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalTarget = bdePerformanceData.reduce((acc, curr) => acc + curr.target, 0);
  const totalAchieved = bdePerformanceData.reduce((acc, curr) => acc + curr.achieved, 0);
  const companyPercentage = Math.round((totalAchieved / totalTarget) * 100);

  const getRankBadge = (index) => {
    switch(index) {
      case 0: return { color: 'bg-yellow-100 text-yellow-600 border-yellow-300', icon: <Trophy size={16} className="mr-1" />, label: 'Rank 1' };
      case 1: return { color: 'bg-gray-200 text-gray-600 border-gray-300', icon: <Medal size={16} className="mr-1" />, label: 'Rank 2' };
      case 2: return { color: 'bg-amber-100 text-amber-700 border-amber-300', icon: <Award size={16} className="mr-1" />, label: 'Rank 3' };
      default: return { color: 'bg-slate-50 text-slate-500 border-slate-200', icon: null, label: `#${index + 1}` };
    }
  };

  return (
    <div className="w-full bg-slate-50/50 min-h-screen pb-12 relative overflow-x-hidden">
      
      {/* 1. STICKY TOP HEADER & SEARCH SECTION */}
      {/* ⬇ FIX: Changed z-40 to z-20 here so mobile sidebar stays on top */}
      <div className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 shadow-sm px-4 sm:px-6 lg:px-8 py-3 sm:h-[90px] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
        <div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-[#084e8d] tracking-tight flex items-center">
            <Flame className="text-[#e9272e] mr-2 flex-shrink-0" size={24} /> Sales Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1 truncate max-w-2xl">
            Monitor real-time BDE performance, track monthly admission targets, and analyze team-wise sales conversions.
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-72 md:w-80 flex-shrink-0">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search BDE, TL..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#084e8d]/50 bg-white shadow-sm"
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* 2. STICKY LEFT COLUMN: Global Target & Motivation Widget */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-[114px] z-30">
          
          {/* Company Global Target */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[13px] sm:text-[14px] font-bold text-slate-800 uppercase tracking-wider flex items-center">
                <Target className="text-[#084e8d] mr-2" size={18} /> Global Target
              </h3>
            </div>
            
            <div className="flex items-end gap-2 mb-2">
              <span className="text-3xl sm:text-4xl font-black text-[#084e8d]">{totalAchieved}</span>
              <span className="text-base sm:text-lg font-bold text-slate-400 mb-1">/ {totalTarget}</span>
            </div>
            
            <div className="w-full bg-slate-100 rounded-full h-3 mb-2 overflow-hidden">
              <div 
                className="bg-[#084e8d] h-3 rounded-full transition-all duration-1000 ease-out relative"
                style={{ width: animateBars ? `${Math.min(companyPercentage, 100)}%` : '0%' }}
              >
                <div className="absolute top-0 left-0 w-full h-full bg-white/20"></div>
              </div>
            </div>
            <p className="text-xs font-bold text-slate-500 text-right">{companyPercentage}% Achieved</p>
          </div>

          {/* Quick Motivation Widget */}
          <div className="bg-gradient-to-br from-[#084e8d] to-[#063a6b] p-5 sm:p-6 rounded-2xl shadow-md text-white relative overflow-hidden">
            <TrendingUp className="absolute -right-4 -bottom-4 text-white/10 pointer-events-none" size={120} />
            <h3 className="text-base sm:text-lg font-bold mb-1 relative z-10">Push for the Top!</h3>
            <p className="text-xs sm:text-sm text-blue-100 mb-4 relative z-10">
              Only {sortedData[0]?.achieved - (sortedData[1]?.achieved || 0)} admissions separate Rank 1 and Rank 2.
            </p>
            <button className="bg-white text-[#084e8d] text-xs font-bold px-4 py-2 rounded-lg shadow hover:bg-slate-50 transition-colors relative z-10">
              View Incentive Plan
            </button>
          </div>
        </div>

        {/* 3. RIGHT COLUMN: BDE Rankings */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-fit w-full min-w-0">
          
          {/* Card Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-2xl">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center truncate">
              <Users className="text-[#084e8d] mr-2 flex-shrink-0" size={18} /> BDE Rankings - August 2026
            </h3>
          </div>

          {/* BDE List */}
          <div className="p-4 sm:p-6 space-y-4">
            {filteredData.length > 0 ? (
              filteredData.map((emp) => {
                const percentage = Math.round((emp.achieved / emp.target) * 100);
                const isOverachiever = percentage >= 100;
                const rank = getRankBadge(sortedData.findIndex(e => e.id === emp.id));

                return (
                  <div key={emp.id} className="group flex flex-col sm:flex-row sm:items-center gap-4 bg-white hover:bg-slate-50 p-4 rounded-xl border border-slate-100 transition-colors shadow-sm">
                    
                    {/* Rank Badge & Info */}
                    <div className="w-full sm:w-2/5 flex items-start sm:items-center gap-3 sm:gap-4">
                      <div className={`flex flex-col items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-lg border ${rank.color} font-black text-xs sm:text-sm shadow-sm flex-shrink-0`}>
                        {rank.icon || rank.label}
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-extrabold text-slate-800 truncate">{emp.name}</h4>
                        <p className="text-xs font-bold text-slate-400 mb-2">{emp.id}</p>
                        
                        {/* TL & Manager Badges */}
                        <div className="flex flex-wrap items-center text-[10px] font-bold uppercase tracking-wider gap-1.5 sm:gap-2">
                          <span className="bg-[#084e8d]/10 border border-[#084e8d]/20 text-[#084e8d] px-2 py-0.5 rounded truncate max-w-[120px]">
                            TL: {emp.tl}
                          </span>
                          <span className="bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded truncate max-w-[120px]">
                            Mgr: {emp.manager}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Target Bar Chart */}
                    <div className="w-full sm:w-3/5 flex flex-col justify-center">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Progress</span>
                        <div className="text-right">
                          <span className="text-base sm:text-lg font-black text-slate-800">{emp.achieved}</span>
                          <span className="text-xs font-bold text-slate-400"> / {emp.target}</span>
                        </div>
                      </div>
                      
                      <div className="w-full bg-slate-100 rounded-full h-3.5 sm:h-4 overflow-hidden relative border border-slate-200/50">
                        <div 
                          className={`h-3.5 sm:h-4 rounded-full transition-all duration-1000 ease-out relative ${
                            isOverachiever ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-[#084e8d] to-blue-400'
                          }`}
                          style={{ width: animateBars ? `${Math.min(percentage, 100)}%` : '0%' }}
                        >
                          <div className="absolute inset-0 bg-white/20" style={{ backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem' }}></div>
                        </div>
                      </div>
                      
                      <div className="mt-1.5 flex justify-end">
                        <span className={`text-[10px] sm:text-[11px] font-black tracking-wider ${isOverachiever ? 'text-green-600' : 'text-[#084e8d]'}`}>
                          {percentage}% {isOverachiever && '🔥 TARGET CRUSHED'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="w-full py-12 text-center flex flex-col items-center justify-center">
                <Search size={40} className="text-slate-300 mb-3" />
                <p className="text-slate-500 font-bold text-sm">No employee found matching that search.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}