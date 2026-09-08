import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Menu } from 'lucide-react';

export default function MainLayout() {
  const userInfo = localStorage.getItem('userInfo');
  // ✅ State for handling mobile sidebar overlay
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900 relative">
      
      {/* ✅ MOBILE OVERLAY (Dark background when sidebar is open on phone) */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* ✅ SIDEBAR WRAPPER (Fixed on mobile, normal flex item on desktop) */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar closeMobile={() => setIsMobileSidebarOpen(false)} />
      </div>
      
      {/* Right Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        
        {/* ✅ TOPBAR WRAPPER (Added Hamburger button for mobile) */}
        <div className="flex items-center w-full bg-white lg:bg-transparent shadow-sm lg:shadow-none z-30">
          <button 
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden p-4 text-slate-500 hover:text-[#084e8d] focus:outline-none"
          >
            <Menu size={24} />
          </button>
          <div className="flex-1 min-w-0">
            <Topbar />
          </div>
        </div>
        
        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto flex flex-col bg-slate-50">
          
          {/* ✅ Responsive Padding (Less padding on mobile, normal on desktop) */}
          <div className="flex-1 p-4 sm:p-6 w-full max-w-full">
            <Outlet /> 
          </div>
          
          {/* ✅ Responsive Footer */}
          <footer className="border-t border-slate-200 py-4 px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center text-[10px] sm:text-xs text-slate-500 bg-white gap-2">
            <div className="text-center sm:text-left">
              &copy; {new Date().getFullYear()} The Raptor Academics. All rights reserved.
            </div>
            <div className="font-medium">
              ERP Version 1.0.0
            </div>
          </footer>
          
        </main>
      </div>
    </div>
  );
}