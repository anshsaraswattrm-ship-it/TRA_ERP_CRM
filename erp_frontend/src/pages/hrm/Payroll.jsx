import { Calculator, CheckCircle } from 'lucide-react';

export default function Payroll() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-12 pt-4 relative overflow-x-hidden">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#084e8d] tracking-tight flex items-center">
          <Calculator className="mr-2 sm:mr-3 flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7" /> Automated Payroll Engine
        </h2>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden w-full">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-[#084e8d] text-white">
              <tr>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-[11px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap">Employee</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-[11px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap">Base Salary</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-[11px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap">Incentives</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-[11px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap">LWP Deductions</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-green-300 whitespace-nowrap">Net Payout</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-right text-[11px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800 text-sm sm:text-base">Aman Sharma</span>
                    <span className="text-[10px] sm:text-xs font-medium text-slate-500 mt-0.5">EMP-001 (BDE)</span>
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-semibold text-slate-600">₹25,000</td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-bold text-green-600">+ ₹5,000</td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-bold text-[#e9272e]">- ₹800</td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm sm:text-base font-extrabold text-[#084e8d]">₹29,200</td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                  <button className="inline-flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#084e8d] text-white rounded-lg hover:bg-[#063a6b] font-bold text-[11px] sm:text-xs shadow-md transition-all transform hover:-translate-y-0.5">
                    <CheckCircle size={14} className="flex-shrink-0" /> Approve
                  </button>
                </td>
              </tr>

              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800 text-sm sm:text-base">Priya Singh</span>
                    <span className="text-[10px] sm:text-xs font-medium text-slate-500 mt-0.5">EMP-003 (TL)</span>
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-semibold text-slate-600">₹40,000</td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-bold text-green-600">+ ₹8,500</td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-bold text-[#e9272e]">- ₹0</td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm sm:text-base font-extrabold text-[#084e8d]">₹48,500</td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                  <button className="inline-flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#084e8d] text-white rounded-lg hover:bg-[#063a6b] font-bold text-[11px] sm:text-xs shadow-md transition-all transform hover:-translate-y-0.5">
                    <CheckCircle size={14} className="flex-shrink-0" /> Approve
                  </button>
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}