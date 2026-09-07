import { Calendar, CheckCircle2, XCircle, Clock, FileText } from 'lucide-react';

export default function LeaveCenter() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-12 pt-4 relative">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-[#084e8d] tracking-tight">Leave Action Center</h2>
        <p className="text-sm text-slate-500 mt-2">Manage your leave applications and team approvals.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Apply Leave Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 relative overflow-hidden h-fit">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#084e8d]"></div>
          <div className="flex items-center mb-6">
            <div className="bg-[#084e8d]/10 p-2 rounded-lg mr-3">
              <Calendar className="text-[#084e8d]" size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Apply for Leave</h3>
          </div>
          
          <form className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Type of Leave</label>
              <select className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#084e8d]/20 focus:border-[#084e8d] transition-all outline-none">
                <option value="" disabled selected>Select Leave Type</option>
                <option>Casual Leave (CL)</option>
                <option>Sick Leave (SL)</option>
                <option>Half-Day Leave</option>
                <option>Compensatory Off (Comp Off)</option>
                <option>Maternity Leave</option>
                <option>Paternity Leave</option>
                <option>Bereavement Leave</option>
                <option>Other</option>
              </select>
            </div>
            
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Start Date</label>
                <input type="date" className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#084e8d]/20 focus:border-[#084e8d] transition-all outline-none" />
              </div>
              <div className="w-1/2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">End Date</label>
                <input type="date" className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#084e8d]/20 focus:border-[#084e8d] transition-all outline-none" />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Reason / Remarks</label>
              <textarea 
                rows="3" 
                placeholder="Briefly describe your reason..."
                className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#084e8d]/20 focus:border-[#084e8d] transition-all outline-none resize-none"
              ></textarea>
            </div>
            
            <button type="button" className="w-full bg-[#084e8d] text-white py-3 rounded-xl hover:bg-[#063a6b] text-sm font-bold shadow-lg shadow-[#084e8d]/20 transition-all transform hover:-translate-y-0.5 mt-2">
              Submit Application
            </button>
          </form>
        </div>
  
        {/* Approval Pipeline */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center">
              <div className="bg-[#084e8d]/10 p-2 rounded-lg mr-3">
                <FileText className="text-[#084e8d]" size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Approval Pipeline</h3>
            </div>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">TL / Manager Access</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider rounded-tl-lg">Employee</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Leave Type & Dates</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Duration</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider rounded-tr-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                
                {/* Pending Request 1 */}
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">Aman Sharma</span>
                      <span className="text-xs font-medium text-slate-500">BDE</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-[#084e8d] text-xs mb-1">Sick Leave (SL)</span>
                      <span className="text-slate-600 text-xs">12 Oct - 14 Oct</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-xs font-semibold">
                      <Clock size={12} /> 3 Days
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <button className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-500 hover:text-white transition-colors text-xs font-bold shadow-sm">
                        <CheckCircle2 size={14} /> Accept
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1.5 bg-[#e9272e]/10 text-[#e9272e] border border-[#e9272e]/30 rounded-lg hover:bg-[#e9272e] hover:text-white transition-colors text-xs font-bold shadow-sm">
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Pending Request 2 */}
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">Rahul Verma</span>
                      <span className="text-xs font-medium text-slate-500">Process Associate</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-[#084e8d] text-xs mb-1">Casual Leave (CL)</span>
                      <span className="text-slate-600 text-xs">20 Oct</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-xs font-semibold">
                      <Clock size={12} /> 1 Day
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <button className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-500 hover:text-white transition-colors text-xs font-bold shadow-sm">
                        <CheckCircle2 size={14} /> Accept
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1.5 bg-[#e9272e]/10 text-[#e9272e] border border-[#e9272e]/30 rounded-lg hover:bg-[#e9272e] hover:text-white transition-colors text-xs font-bold shadow-sm">
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}