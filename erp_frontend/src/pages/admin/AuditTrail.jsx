import { useState } from 'react';
import { Activity, ShieldAlert, User, Search, Filter, RefreshCw, Eye, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

export default function AuditTrail() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('All');
  const [selectedLog, setSelectedLog] = useState(null);

  // Mock Audit Trail Data
  const [auditLogs, setAuditLogs] = useState([
    {
      id: 'LOG-9021',
      timestamp: '11 Aug 2026, 05:42 PM',
      employeeName: 'Rahul Verma',
      employeeId: 'EMP-001',
      role: 'BDE',
      module: 'Student CRM',
      action: 'Updated Stage to VFS Submission',
      targetId: 'RA-2026-MALTA-001',
      ipAddress: '192.168.1.45',
      changes: [
        { field: 'Current Stage', oldVal: 'Document Verification', newVal: 'VFS Submission' }
      ]
    },
    {
      id: 'LOG-9020',
      timestamp: '11 Aug 2026, 04:15 PM',
      employeeName: 'Aman Sharma',
      employeeId: 'EMP-002',
      role: 'Process Associate',
      module: 'Attendance',
      action: 'Clock-In Verified via Location QR',
      targetId: 'EMP-002',
      ipAddress: '192.168.1.88',
      changes: [
        { field: 'Attendance Status', oldVal: 'Pending', newVal: 'Present (On Time)' }
      ]
    },
    {
      id: 'LOG-9019',
      timestamp: '11 Aug 2026, 02:30 PM',
      employeeName: 'Gaurav Saraswat',
      employeeId: 'RA_001_mn_2026',
      role: 'Manager',
      module: 'Payroll Engine',
      action: 'Approved Monthly Net Payout',
      targetId: 'EMP-001 (₹29,200)',
      ipAddress: '192.168.1.10',
      changes: [
        { field: 'Payout Status', oldVal: 'Draft / Unapproved', newVal: 'Final Approved' }
      ]
    },
    {
      id: 'LOG-9018',
      timestamp: '11 Aug 2026, 11:05 AM',
      employeeName: 'Priya Singh',
      employeeId: 'EMP-003',
      role: 'Team Leader',
      module: 'Leave Action Center',
      action: 'Accepted Leave Application',
      targetId: 'Leave-REQ-402',
      ipAddress: '192.168.1.22',
      changes: [
        { field: 'Leave Status', oldVal: 'Pending Review', newVal: 'Accepted (Sick Leave)' }
      ]
    },
    {
      id: 'LOG-9017',
      timestamp: '10 Aug 2026, 06:00 PM',
      employeeName: 'Admin (Founder)',
      employeeId: 'ADM-001',
      role: 'Founder',
      module: 'User Accounts',
      action: 'Provisioned New Staff Credential',
      targetId: 'RA_002_bde_2026',
      ipAddress: '192.168.1.1',
      changes: [
        { field: 'Account Created', oldVal: 'None', newVal: 'Active BDE Account' }
      ]
    }
  ]);

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.targetId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = filterModule === 'All' || log.module === filterModule;
    return matchesSearch && matchesModule;
  });

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-12 pt-4 relative">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-[#084e8d] tracking-tight flex items-center">
            <Activity className="mr-3 text-[#084e8d]" size={28} /> Activity Audit Trail
          </h2>
          <p className="text-sm text-slate-500 mt-1">Real-time security log tracking every employee action, edit, and state change.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => alert('Logs refreshed successfully.')}
            className="flex items-center gap-2 bg-white border border-slate-300 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            <RefreshCw size={16} /> Refresh Stream
          </button>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by Employee, ID, or Action..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 block w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#084e8d]/20 focus:border-[#084e8d] transition-all outline-none shadow-sm"
          />
        </div>

        {/* Module Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <Filter size={16} className="text-slate-400 mr-1 hidden sm:block" />
          {['All', 'Student CRM', 'Attendance', 'Payroll Engine', 'Leave Action Center', 'User Accounts'].map((mod) => (
            <button
              key={mod}
              onClick={() => setFilterModule(mod)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterModule === mod 
                ? 'bg-[#084e8d] text-white shadow-md shadow-[#084e8d]/20' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {mod}
            </button>
          ))}
        </div>
      </div>

      {/* Main Audit Logs Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-[#084e8d] text-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Log ID & Timestamp</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Employee Info</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Module</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Action Executed</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Target ID / Record</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Inspect</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-bold text-[#084e8d]">{log.id}</span>
                        <span className="text-xs font-medium text-slate-500 mt-0.5 flex items-center gap-1">
                          <Clock size={12} /> {log.timestamp}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{log.employeeName}</span>
                        <span className="text-xs text-slate-500">{log.employeeId} • <strong className="text-slate-700">{log.role}</strong></span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200">
                        {log.module}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-xs bg-blue-50 text-[#084e8d] px-2.5 py-1 rounded border border-blue-100 font-bold">
                        {log.targetId}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button 
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-1 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-bold text-xs shadow-sm transition-all"
                      >
                        <Eye size={14} className="text-[#084e8d]" /> Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center text-slate-500 font-medium">
                    No matching audit logs found for your search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Slide-over for Log Inspection */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            
            <div className="flex justify-between items-start pb-4 border-b border-slate-100 mb-6">
              <div>
                <span className="font-mono text-xs font-bold text-[#084e8d] bg-blue-50 px-2.5 py-1 rounded border border-blue-100">
                  {selectedLog.id}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-2">{selectedLog.action}</h3>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">User</span>
                  <strong className="text-slate-800">{selectedLog.employeeName}</strong> ({selectedLog.employeeId})
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Module</span>
                  <strong className="text-slate-800">{selectedLog.module}</strong>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Timestamp</span>
                  <span className="text-slate-700">{selectedLog.timestamp}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">IP Address</span>
                  <span className="font-mono text-xs text-slate-700">{selectedLog.ipAddress}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Recorded State Changes</h4>
                {selectedLog.changes.map((change, idx) => (
                  <div key={idx} className="bg-slate-900 text-white p-4 rounded-xl font-mono text-xs space-y-2">
                    <div className="text-slate-400 border-b border-slate-800 pb-1">Field: {change.field}</div>
                    <div className="flex justify-between text-red-400">
                      <span>[-] Old:</span> <span>{change.oldVal}</span>
                    </div>
                    <div className="flex justify-between text-green-400">
                      <span>[+] New:</span> <span>{change.newVal}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setSelectedLog(null)}
                className="bg-[#084e8d] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-[#063a6b] transition-all"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}