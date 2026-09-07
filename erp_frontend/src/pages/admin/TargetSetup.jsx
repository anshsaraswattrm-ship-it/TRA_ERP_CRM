import { Target, Send, Users, Calendar, Briefcase, TrendingUp } from 'lucide-react';

export default function TargetSetup() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-12 pt-4 relative">
      
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-[#084e8d] tracking-tight flex items-center">
          <Target className="mr-3" size={28} /> Master Target Setup
        </h2>
        <p className="text-sm text-slate-500 mt-2">Configure and broadcast monthly operational targets for the team.</p>
      </div>
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200/80">
        <div className="flex items-center mb-8 pb-4 border-b border-slate-100">
          <div className="bg-[#084e8d]/10 p-2 rounded-lg mr-3">
            <TrendingUp className="text-[#084e8d]" size={20} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Set Monthly Operations Target</h3>
        </div>
        
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Target Role */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center">
                <Users size={14} className="mr-1.5" /> Target Role
              </label>
              <select className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#084e8d]/20 focus:border-[#084e8d] transition-all outline-none">
                <option value="" disabled selected>Select Role / Team</option>
                <option>All BDEs</option>
                <option>Team Leaders</option>
                <option>Process Associates</option>
              </select>
            </div>
            
            {/* Target Month */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center">
                <Calendar size={14} className="mr-1.5" /> Target Month
              </label>
              <input 
                type="month" 
                className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#084e8d]/20 focus:border-[#084e8d] transition-all outline-none" 
              />
            </div>

            {/* Target Admissions */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center">
                <Target size={14} className="mr-1.5" /> Target Admissions (Count)
              </label>
              <input 
                type="number" 
                defaultValue="5" 
                min="1"
                className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#084e8d]/20 focus:border-[#084e8d] transition-all outline-none" 
              />
            </div>

            {/* Revenue Target */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center">
                <Briefcase size={14} className="mr-1.5" /> Revenue Target (Value)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-slate-400 font-bold">₹</span>
                <input 
                  type="number" 
                  placeholder="Enter target amount" 
                  className="block w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#084e8d]/20 focus:border-[#084e8d] transition-all outline-none" 
                />
              </div>
            </div>
          </div>
          
          <div className="pt-8 mt-4 border-t border-slate-100">
            <button 
              type="button" 
              className="w-full flex justify-center items-center bg-[#084e8d] text-white py-3.5 rounded-xl hover:bg-[#063a6b] text-sm font-bold shadow-lg shadow-[#084e8d]/20 transition-all transform hover:-translate-y-0.5"
            >
              <Send className="mr-2" size={18} /> Broadcast Target to Team
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}