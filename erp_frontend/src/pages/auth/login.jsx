import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';

export default function Login() {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); 
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(''); 
    
    if (!employeeId || !password) {
      setErrorMessage("Please enter both Employee ID and Password.");
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('https://tra-erp-crm.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeId, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('userInfo', JSON.stringify(data));
        
        // Role-Based Redirect Logic
        if (data.role === 'Raptor Marketing') {
          navigate('/attendance'); // Sirf inko attendance page pe bhejna hai
        } else {
          navigate('/dashboard'); // Baaki sab dashboard pe jayenge
        }
      } else {
        setErrorMessage(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error("Login Error:", error);
      setErrorMessage("Server is not responding. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 sm:w-96 sm:h-96 bg-[#084e8d]/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 sm:w-96 sm:h-96 bg-[#084e8d]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-[#111827] p-6 sm:p-10 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-slate-800 relative z-10 mx-4">
        
        <div className="text-center mb-8 sm:mb-10">
          <div className="flex justify-center mb-4 sm:mb-6">
            <img 
              src="/logo2.png" 
              alt="Raptor Logo" 
              className="h-12 sm:h-16 w-auto object-contain drop-shadow-lg" 
            />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide uppercase">
            System Access
          </h2>
          <div className="w-12 h-1 bg-[#084e8d] mx-auto mt-3 rounded-full"></div>
        </div>

        <form className="space-y-5 sm:space-y-6" onSubmit={handleLogin}>
          
          {errorMessage && (
            <div className="bg-[#e9272e]/10 border border-[#e9272e]/30 p-3 rounded-lg flex items-start animate-in fade-in zoom-in-95 duration-200">
              <AlertCircle className="text-[#e9272e] h-5 w-5 flex-shrink-0 mr-2.5 mt-0.5" />
              <p className="text-xs sm:text-sm text-[#e9272e] font-medium leading-relaxed break-words">
                {errorMessage}
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Employee ID
            </label>
            <input 
              type="text" 
              required
              value={employeeId}
              onChange={(e) => {
                setEmployeeId(e.target.value);
                setErrorMessage(''); 
              }}
              // ✅ FIX: Replaced hyphens (-) with slashes (/)
              placeholder="e.g. 101/SEP/RAPTOR/26"
              className="block w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#084e8d] focus:border-transparent transition-all shadow-inner" 
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Password
            </label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMessage(''); 
              }}
              placeholder="••••••••"
              className="block w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#084e8d] focus:border-transparent transition-all shadow-inner" 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-6 sm:mt-8 flex justify-center items-center py-3.5 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white bg-[#084e8d] hover:bg-[#063a6b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-[#084e8d] transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
            {loading ? 'Authenticating...' : 'Authenticate'}
          </button>
        </form>

        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-[10px] font-medium text-slate-600 uppercase tracking-widest">
            Restricted Internal Portal
          </p>
        </div>
      </div>
    </div>
  );
}