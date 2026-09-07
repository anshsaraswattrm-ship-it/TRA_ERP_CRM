import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function MainLayout() {
  // Check if user is authenticated
  const userInfo = localStorage.getItem('userInfo');

  // If no token exists, immediately kick them back to login page
  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
      {/* Left Sidebar */}
      <Sidebar />
      
      {/* Right Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Topbar */}
        <Topbar />
        
        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto flex flex-col bg-slate-50">
          
          <div className="flex-1 p-6">
            <Outlet /> 
          </div>
          
          {/* Footer separated by line like the image */}
          <footer className="border-t border-slate-200 py-4 px-6 flex justify-between items-center text-xs text-slate-500 bg-white">
            <div>
              &copy; {new Date().getFullYear()} The Raptor Academics. All rights reserved.
            </div>
            <div>
              ERP Version 1.0.0
            </div>
          </footer>
          
        </main>
      </div>
    </div>
  );
}