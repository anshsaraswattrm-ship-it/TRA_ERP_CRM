import { useState, useEffect } from 'react';
import { Search, UserPlus, Phone, Mail, Target, Edit2, Calendar, X, Briefcase, User, Edit3, BarChart2, Activity, ChevronLeft, ChevronRight } from 'lucide-react';

// --- MOCK DATABASE (Expanded to 65 items to show 50-per-page Pagination) ---
const generateMockLeads = () => {
  const baseLeads = [
    { id: 'STU_ID-1001', name: 'Rahul Sharma', phone: '+91 9876543210', email: 'rahul.s@gmail.com', source: 'Instagram Ads', status: 'Hot', manager: 'EMP-M01 (Gaurav)', bde: 'EMP-B01 (Aman)', remarkText: 'Client office visit on Monday at 2 PM.', date: '12 Oct 2026' },
    { id: 'STU_ID-1002', name: 'Priya Singh', phone: '+91 9988776655', email: 'priya99@yahoo.com', source: 'Google Search', status: 'New', manager: 'EMP-M02 (Sneha)', bde: 'EMP-B02 (Rahul)', remarkText: 'Just registered via website.', date: '14 Oct 2026' },
    { id: 'STU_ID-1003', name: 'Amit Patel', phone: '+91 8877665544', email: 'amit.patel@outlook.com', source: 'Reference', status: 'Converted', manager: 'EMP-M01 (Gaurav)', bde: 'EMP-B01 (Aman)', remarkText: 'Payment cleared. Processing visa.', date: '10 Oct 2026' },
    { id: 'STU_ID-1004', name: 'Neha Gupta', phone: '+91 7766554433', email: 'neha.g@gmail.com', source: 'Website Form', status: 'Follow Up', manager: 'EMP-M01 (Gaurav)', bde: 'EMP-B03 (Vikas)', remarkText: 'Busy right now, asked to call after 6 PM.', date: '15 Oct 2026' },
    { id: 'STU_ID-1005', name: 'Suresh Kumar', phone: '+91 6655443322', email: 'suresh.k@gmail.com', source: 'Facebook Ads', status: 'Dead', manager: 'EMP-M02 (Sneha)', bde: 'EMP-B02 (Rahul)', remarkText: 'Dropping plan for this year due to budget.', date: '05 Oct 2026' },
    { id: 'STU_ID-1006', name: 'Karan Malhotra', phone: '+91 5544332211', email: 'karan.m@gmail.com', source: 'Instagram Ads', status: 'Attempting', manager: 'EMP-M01 (Gaurav)', bde: 'EMP-B01 (Aman)', remarkText: 'Calling but phone is ringing, no response.', date: '16 Oct 2026' },
  ];
  
  // Generating extra dummy data to reach 65 total students
  const statuses = ['New', 'Attempting', 'Contact Success', 'Follow Up', 'Hot', 'Converted', 'Dead'];
  for (let i = 7; i <= 65; i++) {
    baseLeads.push({
      id: `STU_ID-${1000 + i}`,
      name: `Student Demo ${i}`,
      phone: `+91 90000000${i.toString().padStart(2, '0')}`,
      email: `student${i}@demo.com`,
      source: 'Facebook Ads',
      status: statuses[i % statuses.length],
      manager: 'EMP-M01 (Gaurav)',
      bde: 'EMP-B01 (Aman)',
      remarkText: `Auto generated remark for testing pagination. Student #${i}`,
      date: '17 Oct 2026'
    });
  }
  return baseLeads;
};

const initialLeads = generateMockLeads();

export default function LeadsSales() {
  const [leads, setLeads] = useState(initialLeads);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); 
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50; 

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '', phone: '', email: '', source: 'Manual Entry', status: 'New', manager: '', bde: '', remarkText: ''
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLeadData, setEditLeadData] = useState(null);

  // Reset to page 1 whenever search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // --- FILTERING LOGIC ---
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          lead.phone.includes(searchTerm) || 
                          lead.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // --- PAGINATION LOGIC ---
  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLeads = filteredLeads.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // --- GRAPH DATA CALCULATIONS ---
  const totalLeads = leads.length;
  
  const pipelineStatuses = [
    { name: 'New', color: 'bg-blue-500', highlight: 'ring-blue-200', text: 'text-blue-700', bg: 'bg-blue-50' },
    { name: 'Attempting', color: 'bg-amber-500', highlight: 'ring-amber-200', text: 'text-amber-700', bg: 'bg-amber-50' },
    { name: 'Contact Success', color: 'bg-teal-500', highlight: 'ring-teal-200', text: 'text-teal-700', bg: 'bg-teal-50' },
    { name: 'Follow Up', color: 'bg-purple-500', highlight: 'ring-purple-200', text: 'text-purple-700', bg: 'bg-purple-50' },
    { name: 'Hot', color: 'bg-orange-500', highlight: 'ring-orange-200', text: 'text-orange-700', bg: 'bg-orange-50' },
    { name: 'Converted', color: 'bg-emerald-500', highlight: 'ring-emerald-200', text: 'text-emerald-700', bg: 'bg-emerald-50' },
    { name: 'Dead', color: 'bg-[#e9272e]', highlight: 'ring-red-200', text: 'text-[#e9272e]', bg: 'bg-red-50' }
  ];

  const graphData = pipelineStatuses.map(stat => ({
    ...stat,
    count: leads.filter(l => l.status === stat.name).length
  }));

  const maxCount = Math.max(...graphData.map(d => d.count), 1);

  // --- HANDLERS ---
  const handleAddLead = (e) => {
    e.preventDefault();
    const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const generatedId = `STU_ID-${1000 + leads.length + 1}`; 
    
    setLeads([{ ...newLead, id: generatedId, date: todayStr }, ...leads]);
    setIsAddModalOpen(false);
    setNewLead({ name: '', phone: '', email: '', source: 'Manual Entry', status: 'New', manager: '', bde: '', remarkText: '' });
  };

  const handleUpdateLead = (e) => {
    e.preventDefault();
    const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    
    setLeads(leads.map(l => l.id === editLeadData.id ? { ...editLeadData, date: todayStr } : l));
    setIsEditModalOpen(false);
    setEditLeadData(null);
  };

  const handleGraphClick = (statusName) => {
    setStatusFilter(prev => prev === statusName ? 'All' : statusName);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-[#084e8d] tracking-tight">Student Leads Hub</h2>
          <p className="text-sm text-slate-500 mt-1">Click on the chart below to filter your pipeline data.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center bg-[#084e8d] text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-[#063a6b] shadow-lg shadow-[#084e8d]/20 transition-all transform hover:-translate-y-0.5"
        >
          <UserPlus size={18} className="mr-2" /> Add New Student
        </button>
      </div>

      {/* --- INTERACTIVE CHART & KPI SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Total Leads Summary Card */}
        <div className="lg:col-span-1 bg-gradient-to-br from-[#084e8d] to-[#063a6b] rounded-2xl p-6 text-white shadow-sm flex flex-col justify-center relative overflow-hidden">
          <Activity size={100} className="absolute -right-6 -bottom-6 text-white/10" />
          <h3 className="text-blue-100 text-sm font-bold uppercase tracking-wider mb-2 relative z-10">Total Active Pipeline</h3>
          <div className="text-6xl font-black mb-4 relative z-10">{totalLeads}</div>
          <p className="text-xs font-medium text-blue-200 relative z-10">Total student inquiries currently in the system.</p>
        </div>

        {/* Visual Interactive Bar Chart */}
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center">
              <BarChart2 size={16} className="mr-2 text-[#084e8d]" /> Pipeline Status Chart
            </h3>
            {statusFilter !== 'All' && (
              <button 
                onClick={() => setStatusFilter('All')} 
                className="text-xs font-bold text-[#e9272e] bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors"
              >
                Clear Filter
              </button>
            )}
          </div>
          
          <div className="flex items-end h-32 gap-2 sm:gap-4 justify-around px-1 sm:px-4">
            {graphData.map((stat) => {
              const isSelected = statusFilter === stat.name;
              const heightPercentage = (stat.count / maxCount) * 100;
              
              return (
                <div 
                  key={stat.name}
                  onClick={() => handleGraphClick(stat.name)}
                  className={`flex flex-col items-center justify-end w-full cursor-pointer group transition-all`}
                  title={`Click to view ${stat.name} students`}
                >
                  <span className={`text-xs font-black mb-2 transition-colors ${isSelected ? 'text-slate-900 scale-110' : 'text-slate-400 group-hover:text-slate-600'}`}>
                    {stat.count}
                  </span>
                  
                  <div className="w-full relative flex justify-center h-full">
                    <div 
                      className={`w-full max-w-[40px] rounded-t-lg transition-all duration-500 flex justify-center items-end pb-2 ${stat.color} 
                        ${isSelected ? `opacity-100 ring-4 ring-offset-2 ${stat.highlight} shadow-lg` : 'opacity-60 group-hover:opacity-90'}
                      `}
                      style={{ height: `${heightPercentage}%`, minHeight: stat.count > 0 ? '12%' : '4%' }}
                    >
                      {isSelected && <div className="w-1/2 h-full bg-white/20 rounded-t-lg"></div>}
                    </div>
                  </div>
                  
                  <span className={`text-[9px] sm:text-[11px] font-extrabold mt-3 text-center uppercase tracking-wider transition-colors truncate w-full ${isSelected ? 'text-slate-800' : 'text-slate-400 group-hover:text-slate-600'}`} title={stat.name}>
                    {stat.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* --- BULLETPROOF TABLE CONTAINER --- */}
      <div className="flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200">
        
        {/* STICKY SEARCH HEADER */}
        <div className="sticky top-0 bg-slate-50 border-b border-slate-200 p-6 flex flex-col md:flex-row justify-between items-center gap-4 z-40 rounded-t-2xl shadow-sm">
          <div className="flex items-center w-full md:w-auto gap-4">
            <div className="relative flex-1 md:w-96">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by Name, Phone or STU_ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#084e8d]/50 bg-white shadow-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-end w-full md:w-auto">
            {statusFilter !== 'All' ? (
              <span className="text-sm font-bold text-slate-600 flex items-center bg-white px-4 py-2 border border-slate-200 rounded-lg shadow-sm">
                Showing: 
                <span className={`ml-2 px-2 py-0.5 rounded text-xs uppercase tracking-wider 
                  ${graphData.find(g => g.name === statusFilter)?.bg} 
                  ${graphData.find(g => g.name === statusFilter)?.text} border 
                  border-${graphData.find(g => g.name === statusFilter)?.color.split('-')[1]}-200`}>
                  {statusFilter}
                </span>
              </span>
            ) : (
              <span className="text-sm font-bold text-slate-500">Showing All Pipeline Data</span>
            )}
          </div>
        </div>

        {/* INNER TABLE AREA */}
        <div className="w-full bg-slate-50/30">
          <table className="min-w-full divide-y divide-slate-200">
            {/* Table Header sticks right below the search bar */}
            <thead className="bg-[#084e8d] text-white sticky top-[87px] z-30 shadow-sm">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Student Info</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Contact Details</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Hierarchy / Assignee</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider w-72">Status & Manual Remark</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100 relative z-0">
              {paginatedLeads.length > 0 ? (
                paginatedLeads.map((lead) => {
                  const leadConfig = graphData.find(g => g.name === lead.status);
                  
                  return (
                    <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{lead.name}</span>
                          <span className="text-xs font-extrabold text-blue-600 mt-0.5">{lead.id}</span>
                          <span className="text-[10px] text-slate-400 flex items-center mt-1">
                            <Calendar size={10} className="mr-1" /> {lead.date}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center text-sm font-medium text-slate-700">
                            <Phone size={14} className="mr-2 text-slate-400" /> {lead.phone}
                          </div>
                          <div className="flex items-center text-xs text-slate-500">
                            <Mail size={14} className="mr-2 text-slate-400" /> {lead.email}
                          </div>
                          <span className="text-[10px] font-bold text-[#084e8d] uppercase tracking-wider mt-1">{lead.source}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col border-l-2 border-[#084e8d]/20 pl-3">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manager</span>
                          <span className="text-sm font-bold text-[#084e8d] mb-1">{lead.manager}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">BDE</span>
                          <span className="text-sm font-medium text-slate-700">{lead.bde}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className={`px-2.5 py-1 inline-flex text-[11px] leading-5 font-extrabold uppercase tracking-widest rounded-md w-fit border ${leadConfig?.bg} ${leadConfig?.text} border-${leadConfig?.color.split('-')[1]}-200`}>
                            {lead.status}
                          </span>
                          <div className="mt-2 bg-slate-50 p-2.5 rounded border border-slate-100">
                            <span className="block text-[11px] font-medium text-slate-600 italic line-clamp-2" title={lead.remarkText}>
                              "{lead.remarkText || 'No remarks updated yet.'}"
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium align-top">
                        <button 
                          onClick={() => {
                            setEditLeadData(lead);
                            setIsEditModalOpen(true);
                          }}
                          className="flex items-center justify-center w-full text-[#084e8d] bg-white border border-slate-200 hover:bg-[#084e8d]/5 hover:border-[#084e8d]/30 px-3 py-2 rounded-lg shadow-sm transition-colors font-bold text-xs" 
                          title="Update Lead"
                        >
                          <Edit2 size={14} className="mr-1.5" /> Edit & Update
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <Target className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    <p className="text-base font-bold text-slate-700">No students found</p>
                    <p className="text-sm mt-1">Try selecting a different bar on the chart or clear search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* STICKY PAGINATION FOOTER - Fixed to always show at bottom of screen */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between rounded-b-2xl z-40 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
          <div className="text-sm font-medium text-slate-500">
            Showing <span className="font-bold text-slate-800">{filteredLeads.length === 0 ? 0 : startIndex + 1}</span> to <span className="font-bold text-slate-800">{Math.min(startIndex + ITEMS_PER_PAGE, filteredLeads.length)}</span> of <span className="font-bold text-slate-800">{filteredLeads.length}</span> students
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white shadow-sm"
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>
            
            <span className="text-sm font-bold text-[#084e8d] px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-md">
              Page {currentPage} of {totalPages || 1}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white shadow-sm"
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* --- ADD NEW LEAD MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#084e8d] px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center">
                <UserPlus size={20} className="mr-2" /> Add New Student into System
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-blue-200 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddLead} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest border-b pb-2">Student Information</h4>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                    <input required type="text" value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#084e8d] focus:border-transparent" placeholder="e.g. Anjali Sharma" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                      <input required type="tel" value={newLead.phone} onChange={e => setNewLead({...newLead, phone: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#084e8d] focus:border-transparent" placeholder="+91 XXXXX XXXXX" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                      <input type="email" value={newLead.email} onChange={e => setNewLead({...newLead, email: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#084e8d] focus:border-transparent" placeholder="student@email.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Lead Source</label>
                    <select value={newLead.source} onChange={e => setNewLead({...newLead, source: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#084e8d] focus:border-transparent bg-white">
                      <option>Manual Entry</option>
                      <option>Instagram Ads</option>
                      <option>Facebook Ads</option>
                      <option>Google Search</option>
                      <option>Reference</option>
                      <option>Website Form</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest border-b pb-2">Hierarchy Setup</h4>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center"><Briefcase size={14} className="mr-1 text-[#084e8d]"/> Assign to Manager *</label>
                    <select required value={newLead.manager} onChange={e => setNewLead({...newLead, manager: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#084e8d] focus:border-transparent bg-slate-50">
                      <option value="" disabled>Select Manager</option>
                      <option value="EMP-M01 (Gaurav)">EMP-M01 (Gaurav)</option>
                      <option value="EMP-M02 (Sneha)">EMP-M02 (Sneha)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center"><User size={14} className="mr-1 text-[#084e8d]"/> Assign to BDE (Executive) *</label>
                    <select required value={newLead.bde} onChange={e => setNewLead({...newLead, bde: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#084e8d] focus:border-transparent bg-slate-50">
                      <option value="" disabled>Select BDE</option>
                      <option value="EMP-B01 (Aman)">EMP-B01 (Aman)</option>
                      <option value="EMP-B02 (Rahul)">EMP-B02 (Rahul)</option>
                      <option value="EMP-B03 (Vikas)">EMP-B03 (Vikas)</option>
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4 pt-2">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest border-b pb-2">Pipeline Status & Remarks</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Current Status (Matches Graph) *</label>
                      <select required value={newLead.status} onChange={e => setNewLead({...newLead, status: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-[#084e8d] focus:outline-none focus:ring-2 focus:ring-[#084e8d] focus:border-transparent bg-blue-50/50">
                        {pipelineStatuses.map(stat => (
                          <option key={stat.name} value={stat.name}>{stat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center"><Edit3 size={14} className="mr-1 text-[#084e8d]"/> Manual Note (Client's Exact Words)</label>
                      <textarea rows="2" value={newLead.remarkText} onChange={e => setNewLead({...newLead, remarkText: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#084e8d] focus:border-transparent resize-none" placeholder="e.g. Client said they will confirm by tomorrow morning..."></textarea>
                    </div>
                  </div>
                </div>

              </div>
              
              <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-[#084e8d] hover:bg-[#063a6b] rounded-lg shadow-md shadow-[#084e8d]/30 transition-all">
                  Save Student Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- UPDATE REMARK MODAL --- */}
      {isEditModalOpen && editLeadData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#084e8d] px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center">
                <Edit2 size={20} className="mr-2" /> Update Lead Status
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-blue-200 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateLead} className="p-6">
              
              <div className="mb-6 pb-4 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{editLeadData.name}</h4>
                  <p className="text-xs text-slate-500">{editLeadData.id} • {editLeadData.phone}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Assigned BDE</span>
                  <span className="text-xs font-bold text-[#084e8d]">{editLeadData.bde}</span>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Update Pipeline Status *</label>
                  <select required value={editLeadData.status} onChange={e => setEditLeadData({...editLeadData, status: e.target.value})} className="w-full px-3 py-3 border border-slate-300 rounded-lg text-sm font-bold text-[#084e8d] focus:outline-none focus:ring-2 focus:ring-[#084e8d] focus:border-transparent bg-blue-50/50">
                    {pipelineStatuses.map(stat => (
                      <option key={stat.name} value={stat.name}>{stat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center"><Edit3 size={14} className="mr-1 text-[#084e8d]"/> Manual Note (Client's Exact Words) *</label>
                  <textarea required rows="3" value={editLeadData.remarkText} onChange={e => setEditLeadData({...editLeadData, remarkText: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#084e8d] focus:border-transparent resize-none" placeholder="Type the latest discussion details here..."></textarea>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-[#084e8d] hover:bg-[#063a6b] rounded-lg shadow-md shadow-[#084e8d]/30 transition-all">
                  Update Student History
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}