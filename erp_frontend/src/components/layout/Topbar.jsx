import { useState, useEffect } from 'react';

export default function Topbar() {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Get dynamic user info from localStorage
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  
  // Extract Name, Role and Initial
  const userName = userInfo?.name || 'Admin';
  const userRole = userInfo?.role || 'User';
  const userInitial = userName.charAt(0).toUpperCase() || 'U';

  const displayRole = `${userRole} Access`;

  // Real-time clock effect
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-white shadow-sm flex flex-col border-b border-slate-200 z-10 w-full">
      
      {/* Top Main Row: Title & Profile */}
      <div className="h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6 border-b border-slate-100">
        
        {/* Title - responsive text size, truncates if screen is too small */}
        <div className="text-[#084e8d] font-extrabold text-sm sm:text-lg tracking-wide uppercase truncate pr-2">
          Raptor ERP Workspace
        </div>
        
        {/* Right side - Profile & Actions */}
        <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0">
          <div className="flex flex-col text-right hidden sm:block mr-2">
            <span className="text-sm font-bold text-slate-700 block leading-tight">{userName}</span>
            <span className="text-xs text-slate-500 block uppercase tracking-wider">{displayRole}</span>
          </div>
          
          {/* Profile Dynamic Icon with Brand Colors - Scales down slightly on mobile */}
          <div className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-[#084e8d] flex items-center justify-center text-white text-sm sm:text-base font-bold shadow-md cursor-pointer hover:opacity-90 transition-opacity">
            {userInitial}
            {/* Red Notification Dot */}
            <span className="absolute top-0 right-0 block h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-[#e9272e] ring-2 ring-white"></span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Global System Metrics (Swipeable on Mobile) */}
      <div className="bg-slate-50/50 px-4 sm:px-6 py-2.5 sm:py-3 w-full">
        
        {/* Horizontal scroll on mobile (hidden scrollbar), wrap on desktop */}
        <div className="flex sm:flex-wrap gap-3 sm:gap-4 overflow-x-auto pb-1 sm:pb-0 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          <div className="bg-white border border-slate-200 p-2 sm:p-2.5 rounded-lg shadow-sm min-w-[140px] sm:min-w-[180px] flex-shrink-0 sm:flex-1 snap-start">
            <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">System Status</p>
            <p className="text-xs sm:text-sm font-bold text-emerald-600 flex items-center">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 mr-1.5 sm:mr-2 animate-pulse"></span> ONLINE & SYNCED
            </p>
          </div>
          
          <div className="bg-white border border-slate-200 p-2 sm:p-2.5 rounded-lg shadow-sm min-w-[130px] sm:min-w-[180px] flex-shrink-0 sm:flex-1 snap-start">
            <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Active Pipelines</p>
            <p className="text-xs sm:text-sm font-bold text-[#084e8d]">1,248 <span className="text-slate-600 font-medium">Records</span></p>
          </div>
          
          <div className="bg-white border border-slate-200 p-2 sm:p-2.5 rounded-lg shadow-sm min-w-[130px] sm:min-w-[180px] flex-shrink-0 sm:flex-1 snap-start">
            <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Pending Audits</p>
            <p className="text-xs sm:text-sm font-bold text-orange-600">14 <span className="text-slate-600 font-medium">Requires Action</span></p>
          </div>
          
          <div className="bg-white border border-slate-200 p-2 sm:p-2.5 rounded-lg shadow-sm min-w-[140px] sm:min-w-[180px] flex-shrink-0 sm:flex-1 snap-start">
            <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Server Time (IST)</p>
            <p className="text-xs sm:text-sm font-bold text-slate-800 font-mono">
              {currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })}
            </p>
          </div>

        </div>
      </div>
    </header>
  );
}