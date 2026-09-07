import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  CalendarOff, 
  CircleDollarSign, 
  Target, 
  FileText, 
  ShieldCheck,
  LogOut,
  TrendingUp,
  Activity,
  Monitor
} from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get dynamic user role from localStorage
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const userRole = userInfo?.role || ''; 
  
  // State to manage sidebar visibility
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: LayoutDashboard, 
      roles: ['Super Admin', 'Founder and Director', 'Manager', 'Team Leader', 'BDE LEVEL1', 'BDE LEVEL2'] 
    },
    { 
      name: 'Leads & Sales', 
      path: '/leads', 
      icon: TrendingUp, 
      roles: ['Super Admin', 'Founder and Director', 'Manager', 'Team Leader', 'BDE LEVEL1', 'BDE LEVEL2'] 
    },
    { 
      name: 'Student CRM', 
      path: '/students', 
      icon: Users, 
      roles: ['Super Admin', 'Founder and Director', 'Manager', 'Team Leader', 'BDE LEVEL1', 'BDE LEVEL2'] 
    },
    { 
      name: 'Attendance', 
      path: '/attendance', 
      icon: UserCheck, 
      roles: ['Super Admin', 'Founder and Director', 'Manager', 'Team Leader', 'BDE LEVEL1', 'BDE LEVEL2'] 
    },
    { 
      name: 'Leave Action Center', 
      path: '/leaves', 
      icon: CalendarOff, 
      roles: ['Super Admin', 'Founder and Director', 'Manager', 'Team Leader'] 
    },
    { 
      name: 'Payroll Engine', 
      path: '/payroll', 
      icon: CircleDollarSign, 
      roles: ['Super Admin', 'Founder and Director'] 
    },
    { 
      name: 'Master Targets', 
      path: '/targets', 
      icon: Target, 
      roles: ['Super Admin', 'Founder and Director'] 
    },
    { 
      name: 'Employee Documents', 
      path: '/documents', 
      icon: FileText, 
      roles: ['Super Admin', 'Founder and Director', 'Manager'] 
    },
    {
      name: 'IT Face Enrollment',
      path: '/admin/it-face-registration',
      icon: UserCheck,
      roles: ['Super Admin'] 
    },
    {
      name: 'Reception Kiosk View',
      path: '/admin/reception-desk',
      icon: Monitor,
      roles: ['Super Admin', 'Founder and Director', 'Manager'] 
    },
    { 
      name: 'User Accounts', 
      path: '/accounts', 
      icon: ShieldCheck, 
      roles: ['Super Admin'] 
    },
  ];

  // Filter menus based on actual logged-in user's role
  const authorizedMenus = menuItems.filter(item => item.roles.includes(userRole));

  // Secure Logout function
  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('userInfo'); // Remove token
    navigate('/login'); // Redirect to login
  };

  return (
    <div className={`relative bg-[#111827] text-white min-h-screen flex flex-col transition-all duration-300 ease-in-out z-20 border-r border-slate-800 group/sidebar ${isCollapsed ? 'w-20' : 'w-64'}`}>
      
      {/* Top Header: Logo & Toggle */}
      <div className={`h-20 flex items-center border-b border-slate-800 bg-[#111827] px-4 relative overflow-visible group/header ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        
        {!isCollapsed ? (
          <>
            <div className="flex items-center overflow-hidden cursor-pointer" onClick={() => setIsCollapsed(true)}>
              <img 
                src="/logo2.png" 
                alt="Raptor Logo" 
                className="h-14 w-auto object-contain"
              />
            </div>

            <div className="relative group/toggle flex items-center justify-center">
              <button 
                onClick={() => setIsCollapsed(true)}
                className="text-slate-300 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-all duration-200 flex items-center justify-center focus:outline-none"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="4" />
                  <line x1="8" y1="7" x2="8" y2="17" />
                  <polyline points="15 9 12 12 15 15" />
                </svg>
              </button>

              <div className="absolute z-50 px-3 py-1.5 bg-[#282a2c] text-slate-100 text-[13px] font-medium rounded-lg opacity-0 group-hover/toggle:opacity-100 whitespace-nowrap pointer-events-none transition-opacity duration-200 shadow-xl border border-slate-700 top-full mt-2 left-1/2 -translate-x-1/2">
                Close sidebar
              </div>
            </div>
          </>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            
            <div 
              className="absolute inset-0 flex items-center justify-center text-2xl font-black text-white tracking-tighter cursor-pointer transition-opacity duration-300 group-hover/header:opacity-0"
              onClick={() => setIsCollapsed(false)}
            >
              R
            </div>

            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/header:opacity-100 transition-opacity duration-300 group/toggle">
              <button 
                onClick={() => setIsCollapsed(false)}
                className="text-slate-300 hover:text-white p-2 rounded-lg bg-slate-800 hover:bg-slate-700 shadow-md border border-slate-700/80 transition-all duration-200 flex items-center justify-center focus:outline-none"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="4" />
                  <line x1="8" y1="7" x2="8" y2="17" />
                  <polyline points="12 9 15 12 12 15" /> 
                </svg>
              </button>
              
              <div className="absolute z-50 px-3 py-1.5 bg-[#282a2c] text-slate-100 text-[13px] font-medium rounded-lg opacity-0 group-hover/toggle:opacity-100 whitespace-nowrap pointer-events-none transition-opacity duration-200 shadow-xl border border-slate-700 left-full ml-5 top-1/2 -translate-y-1/2">
                Open sidebar
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Navigation Links */}
      <div 
        onClick={(e) => {
          if (isCollapsed && e.target === e.currentTarget) {
            setIsCollapsed(false);
          }
        }}
        className="flex-1 overflow-y-auto py-6 px-3 overflow-x-hidden custom-scrollbar flex flex-col"
      >
        
        <div className={`px-3 mb-2 transition-opacity duration-200 ${isCollapsed ? 'opacity-0 h-0 hidden' : 'opacity-100'}`}>
          <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase whitespace-nowrap">
            Main Menu
          </p>
        </div>
        
        <nav className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
          {authorizedMenus.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => window.innerWidth < 768 && setIsCollapsed(true)}
                className={`group relative flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive 
                  ? 'bg-[#084e8d] text-white shadow-md' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                
                <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                  isCollapsed ? 'w-0 opacity-0 ml-0' : 'w-full opacity-100 ml-3'
                }`}>
                  {item.name}
                </span>

                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#282a2c] border border-slate-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-50 shadow-lg">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* Logout Button */}
      <div className="p-4 bg-[#111827] border-t border-slate-800">
        <button 
          onClick={handleLogout}
          className={`w-full group relative flex items-center px-3 py-2.5 text-sm font-bold text-[#e9272e] hover:bg-slate-800 hover:text-red-400 rounded-lg transition-colors ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span className={`text-left overflow-hidden whitespace-nowrap transition-all duration-300 ${
            isCollapsed ? 'w-0 opacity-0 ml-0' : 'w-full opacity-100 ml-3'
          }`}>
            Logout
          </span>

          {isCollapsed && (
            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#282a2c] border border-slate-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-50 shadow-lg">
              Logout
            </div>
          )}
        </button>
      </div>
      
    </div>
  );
}