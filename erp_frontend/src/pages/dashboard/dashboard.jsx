import { useState, useEffect } from 'react';
import { Target, TrendingUp, Trophy, Flame, Medal, Award, Search, Users } from 'lucide-react';

// --- COMPETITIVE MOCK DATABASE ---
const bdePerformanceData = [
  { id: 'EMP-001', name: 'Vishal Sharma', role: 'BDE', tl: 'Neha Gupta', manager: 'Rajeev Singh', target: 20, achieved: 22 }, // Overachiever
  { id: 'EMP-002', name: 'Aman Verma', role: 'BDE', tl: 'Neha Gupta', manager: 'Rajeev Singh', target: 20, achieved: 14 },
  { id: 'EMP-003', name: 'Priya Desai', role: 'BDE', tl: 'Vikram Malhotra', manager: 'Rajeev Singh', target: 15, achieved: 12 },
  { id: 'EMP-004', name: 'Rohan Kapoor', role: 'BDE', tl: 'Vikram Malhotra', manager: 'Arun Bajaj', target: 25, achieved: 8 },
  { id: 'EMP-005', name: 'Sneha Rao', role: 'BDE', tl: 'Neha Gupta', manager: 'Arun Bajaj', target: 20, achieved: 19 },
  { id: 'EMP-006', name: 'Karan Singh', role: 'BDE', tl: 'Vikram Malhotra', manager: 'Rajeev Singh', target: 15, achieved: 2 },
];

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [animateBars, setAnimateBars] = useState(false);

  // Trigger animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setAnimateBars(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Sort data dynamically based on highest percentage achieved
  const sortedData = [...bdePerformanceData].sort((a, b) => {
    const aPercent = (a.achieved / a.target) * 100;
    const bPercent = (b.achieved / b.target) * 100;
    return bPercent - aPercent;
  });

  // Filter based on search (EMP ID, Name, TL, or Manager)
  const filteredData = sortedData.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.tl.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.manager.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate Company Totals
  const totalTarget = bdePerformanceData.reduce((acc, curr) => acc + curr.target, 0);
  const totalAchieved = bdePerformanceData.reduce((acc, curr) => acc + curr.achieved, 0);
  const companyPercentage = Math.round((totalAchieved / totalTarget) * 100);

  // Helper function for podium colors
  const getRankBadge = (index) => {
    switch(index) {
      case 0: return { color: 'bg-yellow-100 text-yellow-600 border-yellow-300', icon: <Trophy size={16} className="mr-1" />, label: 'Rank 1' };
      case 1: return { color: 'bg-gray-200 text-gray-600 border-gray-300', icon: <Medal size={16} className="mr-1" />, label: 'Rank 2' };
      case 2: return { color: 'bg-amber-100 text-amber-700 border-amber-300', icon: <Award size={16} className="mr-1" />, label: 'Rank 3' };
      default: return { color: 'bg-slate-50 text-slate-500 border-slate-200', icon: null, label: `#${index + 1}` };
    }
  };

  return (
    <div className="w-full bg-slate-50/50 min-h-screen pb-12 relative">
      

      {/* 1. STICKY TOP HEADER & SEARCH SECTION */}
      {/* PERFECT HEIGHT FIX: Strictly set to h-[90px] so the gap logic never breaks */}
      <div className="sticky top-0 z-40 bg-slate-50 border-b border-slate-200 shadow-sm px-4 sm:px-6 lg:px-8 h-[90px] flex items-center justify-between w-full">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#084e8d] tracking-tight flex items-center">
            <Flame className="text-[#e9272e] mr-2" size={28} /> Sales Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Monitor real-time BDE performance, track monthly admission targets, and analyze team-wise sales conversions across the active pipeline.
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full max-w-[200px] sm:max-w-[300px] md:w-96">
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
      <div className="px-4 sm:px-6 lg:px-8 pt-6 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* 2. STICKY LEFT COLUMN: Global Target & Motivation Widget */}
        <div className="lg:col-span-1 space-y-6 sticky top-[114px] z-30">
          
          {/* Company Global Target */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[14px] font-bold text-slate-800 uppercase tracking-wider flex items-center">
                <Target className="text-[#084e8d] mr-2" size={18} /> Global Target
              </h3>
            </div>
            
            <div className="flex items-end gap-2 mb-2">
              <span className="text-4xl font-black text-[#084e8d]">{totalAchieved}</span>
              <span className="text-lg font-bold text-slate-400 mb-1">/ {totalTarget}</span>
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
          <div className="bg-gradient-to-br from-[#084e8d] to-[#063a6b] p-6 rounded-2xl shadow-md text-white relative overflow-hidden">
            <TrendingUp className="absolute -right-4 -bottom-4 text-white/10" size={120} />
            <h3 className="text-lg font-bold mb-1 relative z-10">Push for the Top!</h3>
            <p className="text-sm text-blue-100 mb-4 relative z-10">
              Only {sortedData[0]?.achieved - (sortedData[1]?.achieved || 0)} admissions separate Rank 1 and Rank 2.
            </p>
            <button className="bg-white text-[#084e8d] text-xs font-bold px-4 py-2 rounded-lg shadow hover:bg-slate-50 transition-colors relative z-10">
              View Incentive Plan
            </button>
          </div>
        </div>

        {/* 3. RIGHT COLUMN: BDE Rankings Header flush perfectly with Top Header */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-fit">
          
          {/* STICKY CARD HEADER: Exactly at 89px (1px overlap to completely hide any transparent background gap) */}
          <div className="sticky top-[89px] z-30 p-5 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-2xl">
            <h3 className="text-lg font-bold text-slate-800 flex items-center">
              <Users className="text-[#084e8d] mr-2" size={20} /> BDE Rankings - August 2026
            </h3>
          </div>

          {/* BDE List */}
          <div className="p-6 space-y-4">
            {filteredData.length > 0 ? (
              filteredData.map((emp) => {
                const percentage = Math.round((emp.achieved / emp.target) * 100);
                const isOverachiever = percentage >= 100;
                const rank = getRankBadge(sortedData.findIndex(e => e.id === emp.id));

                return (
                  <div key={emp.id} className="group flex flex-col sm:flex-row sm:items-center gap-4 bg-white hover:bg-slate-50 p-4 rounded-xl border border-slate-100 transition-colors shadow-sm">
                    
                    {/* Rank Badge & Info */}
                    <div className="sm:w-2/5 flex items-start sm:items-center gap-4">
                      <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg border ${rank.color} font-black text-sm shadow-sm flex-shrink-0`}>
                        {rank.icon || rank.label}
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800">{emp.name}</h4>
                        <p className="text-xs font-bold text-slate-400 mb-2">{emp.id}</p>
                        
                        {/* TL & Manager Badges */}
                        <div className="flex flex-wrap items-center text-[10px] font-bold uppercase tracking-wider gap-2">
                          <span className="bg-[#084e8d]/10 border border-[#084e8d]/20 text-[#084e8d] px-2 py-0.5 rounded">
                            TL: {emp.tl}
                          </span>
                          <span className="bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded">
                            Mgr: {emp.manager}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Target Bar Chart */}
                    <div className="sm:w-3/5 flex flex-col justify-center">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Progress</span>
                        <div className="text-right">
                          <span className="text-lg font-black text-slate-800">{emp.achieved}</span>
                          <span className="text-xs font-bold text-slate-400"> / {emp.target}</span>
                        </div>
                      </div>
                      
                      <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden relative border border-slate-200/50">
                        <div 
                          className={`h-4 rounded-full transition-all duration-1000 ease-out relative ${
                            isOverachiever ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-[#084e8d] to-blue-400'
                          }`}
                          style={{ width: animateBars ? `${Math.min(percentage, 100)}%` : '0%' }}
                        >
                          <div className="absolute inset-0 bg-white/20" style={{ backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem' }}></div>
                        </div>
                      </div>
                      
                      <div className="mt-1.5 flex justify-end">
                        <span className={`text-[11px] font-black tracking-wider ${isOverachiever ? 'text-green-600' : 'text-[#084e8d]'}`}>
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
                <p className="text-slate-500 font-bold">No employee found matching that search.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}