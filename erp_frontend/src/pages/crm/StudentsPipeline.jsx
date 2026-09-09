import { useState, useEffect } from 'react';
import { Check, X, Search, UserPlus, Milestone, RotateCcw, UploadCloud, FileText, Trash2, FolderOpen, BookOpen, CreditCard, Lock, Activity, User, Phone, Mail, Menu } from 'lucide-react';

// --- Reusable StepRow Component ---
const StepRow = ({ 
  label, stepKey, activeStudent, isSubStep = false, isPayment = false, hasDateInput = false, isLocked = false, onAction, onChange, onFileUpload, onFileDelete
}) => {
  const stepData = activeStudent?.progress?.[stepKey];
  const isPass = stepData?.status === 'pass';
  const isFail = stepData?.status === 'fail';

  return (
    <div className={`relative flex flex-col p-4 sm:p-5 mb-4 rounded-xl border transition-all duration-300 ${
      isLocked ? 'bg-slate-50/50 border-slate-200/50 opacity-60' :
      isPass ? 'bg-emerald-50/60 border-emerald-200 shadow-sm' : 
      isFail ? 'bg-[#e9272e]/5 border-[#e9272e]/20 shadow-sm' : 
      'bg-white border-slate-200 shadow-md shadow-slate-200/40 hover:border-[#084e8d]/40 hover:shadow-lg hover:shadow-[#084e8d]/10'
    }`}>
      <div className={isLocked ? 'pointer-events-none' : ''}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col">
            <h4 className={`font-semibold flex items-center gap-2 break-words ${isSubStep ? 'text-[13px] sm:text-[14px] text-slate-700' : 'text-[14px] sm:text-[15px] text-slate-800'}`}>
              {isLocked && <Lock size={14} className="text-slate-400 flex-shrink-0" />}
              {label}
            </h4>
            <span className={`text-xs mt-1 font-medium ${isPass ? 'text-emerald-600' : isFail ? 'text-[#e9272e]' : 'text-slate-400'}`}>
              {isLocked ? 'Locked (Complete previous step)' : stepData?.date ? `Updated on: ${stepData.date}` : 'Action Pending'}
            </span>
          </div>
          
          <div className="flex gap-2 self-end sm:self-auto flex-shrink-0">
            <button onClick={() => onAction(stepKey, 'pending')} disabled={!isPass && !isFail} title="Undo / Reset" className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${(!isPass && !isFail) ? 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm'}`}>
              <RotateCcw size={14} strokeWidth={2.5} />
            </button>
            <button onClick={() => onAction(stepKey, 'pass')} className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${isPass ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' : 'bg-slate-50 text-slate-400 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-500 hover:border-emerald-300'}`}>
              <Check size={16} strokeWidth={isPass ? 3 : 2} />
            </button>
            <button onClick={() => onAction(stepKey, 'fail')} className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${isFail ? 'bg-[#e9272e] text-white shadow-md shadow-[#e9272e]/20' : 'bg-slate-50 text-slate-400 border border-slate-200 hover:bg-[#e9272e]/10 hover:text-[#e9272e] hover:border-[#e9272e]/30'}`}>
              <X size={16} strokeWidth={isFail ? 3 : 2} />
            </button>
          </div>
        </div>

        {isPayment && (
          <div className="mt-4 pt-4 border-t border-slate-200/70 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Amount (INR)</label>
              <input type="number" placeholder="₹ Amount" value={stepData?.amountINR || ''} onChange={(e) => onChange(stepKey, 'amountINR', e.target.value)} className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#084e8d]/20 focus:border-[#084e8d] transition-all outline-none" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Amount (EUR)</label>
              <input type="number" placeholder="€ Amount" value={stepData?.amountEUR || ''} onChange={(e) => onChange(stepKey, 'amountEUR', e.target.value)} className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#084e8d]/20 focus:border-[#084e8d] transition-all outline-none" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Transaction Date</label>
              <input type="date" value={stepData?.transactionDate || ''} onChange={(e) => onChange(stepKey, 'transactionDate', e.target.value)} className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#084e8d]/20 focus:border-[#084e8d] transition-all outline-none" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Receipt / Proof</label>
              <div className="flex items-center h-[38px]">
                {stepData?.receipt ? (
                  <div className="flex w-full items-center justify-between bg-emerald-50 px-3 py-2 border border-emerald-200 rounded-lg h-full">
                    <span className="text-[11px] font-semibold text-emerald-700 truncate mr-2" title={stepData.receipt.name}>{stepData.receipt.name}</span>
                    <button onClick={() => onFileDelete(stepKey)} className="text-[#e9272e]/70 hover:text-[#e9272e] bg-white p-1 rounded border border-[#e9272e]/20 flex-shrink-0"><Trash2 size={12} /></button>
                  </div>
                ) : (
                  <label className="cursor-pointer w-full h-full flex items-center justify-center bg-slate-50 hover:bg-[#084e8d]/5 border border-dashed border-slate-300 rounded-lg transition-colors group">
                    <UploadCloud size={14} className="text-slate-400 mr-2 flex-shrink-0" />
                    <span className="text-[12px] font-semibold text-slate-600 group-hover:text-[#084e8d]">Upload</span>
                    <input type="file" className="hidden" onChange={(e) => onFileUpload(stepKey, e.target.files[0])} />
                  </label>
                )}
              </div>
            </div>
          </div>
        )}

        {!isPayment && hasDateInput && (
          <div className="mt-4 pt-4 border-t border-slate-200/70">
            <div className="w-full sm:w-1/2 lg:w-1/3 min-w-[200px]">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Scheduled Date</label>
              <input type="date" value={stepData?.scheduledDate || ''} onChange={(e) => onChange(stepKey, 'scheduledDate', e.target.value)} className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#084e8d]/20 focus:border-[#084e8d] transition-all outline-none" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function StudentsPipeline() {
  const [currentDate, setCurrentDate] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeStudent, setActiveStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('pipeline');

  const allSteps = ['counselling', 'documentation', 'vfs_docs', 'vfs_submission', 'cvu_interview', 'visa_status', 'flight_tickets'];
  const documentSlots = [
    { key: 'passport', label: 'Passport (Front & Back)' },
    { key: 'academics', label: 'Academic Transcripts' },
    { key: 'financials', label: 'Bank Statements' },
    { key: 'offer_letter', label: 'College/University Offer Letter' },
    { key: 'photo', label: 'Student Photo' },
    { key: 'lor_moi', label: 'LOR / MOI' }
  ];

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setCurrentDate(today);
  }, []);

  const handleStepAction = (stepKey, statusValue) => {
    const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    setActiveStudent(prev => ({ ...prev, progress: { ...prev.progress, [stepKey]: { ...prev?.progress?.[stepKey], status: statusValue, date: statusValue === 'pending' ? null : todayStr } } }));
  };

  const handleMasterAction = (statusValue) => {
    const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const newProgress = { ...(activeStudent?.progress || {}) }; 
    allSteps.forEach(step => {
      newProgress[step] = { ...(newProgress[step] || {}), status: statusValue, date: statusValue === 'pending' ? null : todayStr };
    });
    setActiveStudent(prev => ({ ...prev, progress: newProgress }));
  };

  const handleExtraFieldChange = (stepKey, field, value) => {
    setActiveStudent(prev => ({ ...prev, progress: { ...prev.progress, [stepKey]: { ...(prev?.progress?.[stepKey] || { status: 'pending' }), [field]: value } } }));
  };

  const handlePaymentFileUpload = (stepKey, file) => {
    if (!file) return;
    setActiveStudent(prev => ({ ...prev, progress: { ...prev.progress, [stepKey]: { ...(prev?.progress?.[stepKey] || { status: 'pending' }), receipt: { name: file.name } } } }));
  };

  const handlePaymentFileDelete = (stepKey) => {
    setActiveStudent(prev => {
      const stepData = { ...(prev?.progress?.[stepKey] || {}) };
      delete stepData.receipt;
      return { ...prev, progress: { ...prev.progress, [stepKey]: stepData } };
    });
  };

  const handleFileUpload = (docKey, file) => {
    if (!file) return;
    const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    setActiveStudent(prev => ({ ...prev, documents: { ...(prev?.documents || {}), [docKey]: { name: file.name, date: todayStr } } }));
  };

  const handleDeleteFile = (docKey) => {
    setActiveStudent(prev => {
      const newDocs = { ...(prev?.documents || {}) };
      delete newDocs[docKey];
      return { ...prev, documents: newDocs };
    });
  };

  const handleDetailChange = (field, value) => {
    setActiveStudent(prev => ({ ...prev, details: { ...(prev?.details || {}), [field]: value } }));
  };

  const handleSearch = () => {
    const queryId = searchInput.trim() === '' ? 'APP-1001' : searchInput.trim();
    
    setActiveStudent({
      id: queryId,
      name: 'Sample Applicant',
      phone: '+91 9876543210',
      email: 'applicant@example.com',
      city: 'Delhi, India',
      progress: {},
      documents: {},
      details: { intake: '', college: '' }
    });
    setActiveTab('pipeline');
  };

  const checkIsLocked = (index) => {
    if (index === 0) return false; 
    if (!activeStudent || !activeStudent.progress) return true;
    const prevStepKey = allSteps[index - 1];
    return activeStudent.progress[prevStepKey]?.status !== 'pass';
  };

  const isAllPassed = activeStudent ? allSteps.every(step => activeStudent.progress?.[step]?.status === 'pass') : false;
  const isAllFailed = activeStudent ? allSteps.every(step => activeStudent.progress?.[step]?.status === 'fail') : false;
  const isAllPending = activeStudent ? allSteps.every(step => !activeStudent.progress?.[step]?.status || activeStudent.progress?.[step]?.status === 'pending') : false;

  return (
    <div className="w-full bg-slate-50/50 min-h-screen pb-12 relative overflow-x-hidden">
      
      {/* 1. STICKY TOP HEADER */}
      {/* ⬇ FIX: Changed z-50 to z-20 here so mobile sidebar stays on top */}
      <div className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 shadow-sm px-4 sm:px-6 lg:px-8 py-3 sm:h-[90px] flex flex-col justify-center w-full">
        <h2 className="text-xl sm:text-3xl font-extrabold text-[#084e8d] tracking-tight">Student CRM Pipeline</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1 truncate">Manage onboarding, financial ledgers, and milestone tracking seamlessly.</p>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 pt-6 max-w-7xl mx-auto w-full">
        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 mb-8 overflow-hidden relative z-10">
          <div className="bg-gradient-to-r from-[#084e8d]/5 to-white px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center">
            <div className="bg-[#084e8d]/10 p-2 rounded-lg mr-3 flex-shrink-0">
              <UserPlus className="text-[#084e8d]" size={18} />
            </div>
            <h3 className="text-sm sm:text-[15px] font-bold text-slate-800 uppercase tracking-wider">New Application Setup</h3>
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Application ID</label>
                <input type="text" placeholder="e.g. APP-1001" className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#084e8d]/20 focus:border-[#084e8d] transition-all outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Registration Date</label>
                <input type="date" value={currentDate} readOnly className="block w-full px-4 py-2.5 bg-slate-100/70 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 outline-none cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Full Name</label>
                <input type="text" placeholder="Student Name" className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#084e8d]/20 focus:border-[#084e8d] transition-all outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Assigned Executive</label>
                <select className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#084e8d]/20 focus:border-[#084e8d] transition-all outline-none">
                  <option value="">Select BDE</option>
                  <option>BDE-001 (Aman)</option>
                  <option>BDE-002 (Rahul)</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button className="w-full sm:w-auto bg-[#084e8d] text-white px-8 py-2.5 rounded-lg text-sm font-bold hover:bg-[#063a6b] shadow-lg shadow-[#084e8d]/20 transition-all transform hover:-translate-y-0.5">
                Initialize Profile
              </button>
            </div>
          </div>
        </div>

        {/* 2. Workspace Engine */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 flex flex-col relative z-20">
          
          {/* Workspace Header & Search */}
          <div className="bg-white rounded-t-2xl border-b border-slate-200">
            <div className="bg-gradient-to-r from-slate-50 to-white px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center rounded-t-2xl">
              <div className="bg-slate-200/50 p-2 rounded-lg mr-3 flex-shrink-0">
                <Activity className="text-slate-700" size={18} />
              </div>
              <h3 className="text-sm sm:text-[15px] font-bold text-slate-800 uppercase tracking-wider">Active Workspace</h3>
            </div>
            
            <div className="p-4 sm:px-8 sm:py-5">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex-1 relative w-full">
                  <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Enter Application ID to fetch record..." 
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-12 block w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#084e8d]/20 focus:border-[#084e8d] transition-all outline-none shadow-sm"
                  />
                </div>
                <button 
                  onClick={handleSearch}
                  className="w-full sm:w-auto bg-slate-900 text-white px-6 sm:px-10 py-3 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-md hover:shadow-lg flex-shrink-0"
                >
                  Fetch Data
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="p-4 sm:p-8 relative">
            {activeStudent ? (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 animate-in fade-in duration-500 items-start">
                
                {/* 3. STUDENT PROFILE CARD (Non-sticky on mobile, sticky on large screens) */}
                <div className="lg:col-span-1 lg:sticky lg:top-[114px] z-30">
                  <div className="bg-[#084e8d]/5 rounded-2xl p-5 sm:p-6 border border-[#084e8d]/20 shadow-sm">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#084e8d]/10 rounded-full flex items-center justify-center mb-4">
                      <User size={28} className="text-[#084e8d] sm:w-8 sm:h-8" />
                    </div>
                    <h4 className="text-lg sm:text-xl font-extrabold text-slate-800 mb-1 break-words">{activeStudent?.name || 'Applicant'}</h4>
                    <p className="text-sm font-bold text-[#084e8d] mb-5">{activeStudent?.id || 'N/A'}</p>
                    
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center text-xs sm:text-sm text-slate-600">
                        <Phone size={15} className="text-slate-400 mr-3 flex-shrink-0" /> <span className="truncate">{activeStudent?.phone || 'No phone'}</span>
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-slate-600">
                        <Mail size={15} className="text-slate-400 mr-3 flex-shrink-0" /> <span className="truncate">{activeStudent?.email || 'No email'}</span>
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-slate-600">
                        <span className="font-bold text-slate-400 mr-3 text-[10px] sm:text-xs uppercase tracking-widest flex-shrink-0">CITY</span> <span className="truncate">{activeStudent?.city || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Tabs & Main Content */}
                <div className="lg:col-span-3 w-full min-w-0">
                  
                  {/* Scrollable Tabs on Mobile */}
                  <div className="flex bg-slate-100 p-1.5 rounded-xl w-full mb-6 overflow-x-auto no-scrollbar gap-1">
                    <button onClick={() => setActiveTab('pipeline')} className={`flex items-center px-4 sm:px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 ${activeTab === 'pipeline' ? 'bg-white text-[#084e8d] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                      <Milestone size={15} className="mr-2" /> Workflow
                    </button>
                    <button onClick={() => setActiveTab('payments')} className={`flex items-center px-4 sm:px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 ${activeTab === 'payments' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                      <CreditCard size={15} className="mr-2" /> Payments
                    </button>
                    <button onClick={() => setActiveTab('vault')} className={`flex items-center px-4 sm:px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 ${activeTab === 'vault' ? 'bg-white text-[#084e8d] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                      <FolderOpen size={15} className="mr-2" /> Vault
                    </button>
                    <button onClick={() => setActiveTab('academic')} className={`flex items-center px-4 sm:px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 ${activeTab === 'academic' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                      <BookOpen size={15} className="mr-2" /> Academics
                    </button>
                  </div>

                  {/* --- TAB CONTENT RENDERER --- */}
                  <div className="mt-2">
                    
                    {/* 1. DOCUMENT VAULT TAB */}
                    {activeTab === 'vault' && (
                      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 sm:p-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
                        <div className="flex items-center mb-6">
                          <div className="bg-[#084e8d]/10 p-2 rounded-lg mr-3"><FolderOpen className="text-[#084e8d]" size={18} /></div>
                          <h4 className="font-bold text-slate-800 text-base sm:text-lg">Student Document Vault</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                          {documentSlots.map((slot) => {
                            const docData = activeStudent.documents?.[slot.key];
                            const isUploaded = !!docData;
                            return (
                              <div key={slot.key} className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex items-center gap-2.5 pr-2">
                                    <FileText size={18} className={`${isUploaded ? 'text-emerald-500' : 'text-slate-400'} flex-shrink-0`} />
                                    <span className="font-semibold text-xs sm:text-sm text-slate-700">{slot.label}</span>
                                  </div>
                                  {isUploaded && <Check size={18} className="text-emerald-500 flex-shrink-0" strokeWidth={3} />}
                                </div>
                                {isUploaded ? (
                                  <div className="mt-1 bg-emerald-50/80 rounded-lg p-2.5 border border-emerald-100">
                                    <p className="text-xs text-slate-800 font-bold truncate mb-1" title={docData.name}>{docData.name}</p>
                                    <div className="flex justify-between items-center mt-2">
                                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{docData.date}</span>
                                      <button onClick={() => handleDeleteFile(slot.key)} className="text-[#e9272e]/70 hover:text-[#e9272e] bg-white p-1.5 rounded-md shadow-sm border border-slate-100 transition-colors"><Trash2 size={14} /></button>
                                    </div>
                                  </div>
                                ) : (
                                  <label className="cursor-pointer bg-white hover:bg-[#084e8d]/5 hover:border-[#084e8d]/30 hover:text-[#084e8d] border border-dashed border-slate-300 rounded-lg flex justify-center py-3 transition-colors group mt-auto">
                                    <span className="text-xs font-bold text-slate-500 group-hover:text-[#084e8d] flex items-center gap-2"><UploadCloud size={16} /> Click to Upload</span>
                                    <input type="file" className="hidden" onChange={(e) => handleFileUpload(slot.key, e.target.files[0])} />
                                  </label>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 2. ACADEMIC DETAILS TAB */}
                    {activeTab === 'academic' && (
                      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 sm:p-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
                        <div className="flex items-center mb-6">
                          <div className="bg-orange-100 p-2 rounded-lg mr-3"><BookOpen className="text-orange-600" size={18} /></div>
                          <h4 className="font-bold text-slate-800 text-base sm:text-lg">Academic Details</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Target Intake</label>
                            <input type="text" placeholder="e.g. Sep 2026" value={activeStudent.details?.intake || ''} onChange={(e) => handleDetailChange('intake', e.target.value)} className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#084e8d]/20 focus:border-[#084e8d] transition-all outline-none" />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">College/University Name</label>
                            <input type="text" placeholder="e.g. University of Malta" value={activeStudent.details?.college || ''} onChange={(e) => handleDetailChange('college', e.target.value)} className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#084e8d]/20 focus:border-[#084e8d] transition-all outline-none" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 3. FINANCIAL & PAYMENT LEDGER TAB */}
                    {activeTab === 'payments' && (
                      <div className="bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-lg shadow-slate-900/10 animate-in slide-in-from-bottom-2 fade-in duration-300">
                        <div className="flex items-center mb-6">
                          <div className="bg-emerald-500/20 p-2 rounded-lg mr-3 border border-emerald-500/30"><CreditCard className="text-emerald-400" size={18} /></div>
                          <h4 className="font-bold text-white text-base sm:text-lg tracking-wide">Financial & Payment Ledger</h4>
                        </div>
                        <div className="space-y-4">
                          <StepRow label="Application Fee" stepKey="app_fee" isPayment={true} activeStudent={activeStudent} onAction={handleStepAction} onChange={handleExtraFieldChange} onFileUpload={handlePaymentFileUpload} onFileDelete={handlePaymentFileDelete} />
                          <StepRow label="Stage 1 Processing Fee" stepKey="stage_1" isPayment={true} activeStudent={activeStudent} onAction={handleStepAction} onChange={handleExtraFieldChange} onFileUpload={handlePaymentFileUpload} onFileDelete={handlePaymentFileDelete} />
                          <StepRow label="Stage 2 Consultation Fee" stepKey="stage_2" isPayment={true} activeStudent={activeStudent} onAction={handleStepAction} onChange={handleExtraFieldChange} onFileUpload={handlePaymentFileUpload} onFileDelete={handlePaymentFileDelete} />
                          <StepRow label="University Tuition Fee Transfer" stepKey="tuition_fee" isPayment={true} activeStudent={activeStudent} onAction={handleStepAction} onChange={handleExtraFieldChange} onFileUpload={handlePaymentFileUpload} onFileDelete={handlePaymentFileDelete} />
                        </div>
                      </div>
                    )}

                    {/* 4. SEQUENTIAL MILESTONE PIPELINE TAB */}
                    {activeTab === 'pipeline' && (
                      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 sm:p-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                          <div className="flex items-center">
                            <div className="bg-[#084e8d]/10 p-2 rounded-lg mr-3"><Milestone className="text-[#084e8d]" size={18} /></div>
                            <h4 className="font-bold text-slate-800 text-base sm:text-lg">Visa & Application Workflow</h4>
                          </div>
                          <div className="flex items-center justify-between sm:justify-start gap-3 bg-slate-50 px-3 sm:px-4 py-2 rounded-xl border border-slate-200 shadow-inner">
                            <span className="text-[11px] sm:text-xs font-extrabold text-slate-500 uppercase tracking-widest">Master Override:</span>
                            <div className="flex gap-1.5">
                              <button onClick={() => handleMasterAction('pending')} disabled={isAllPending} className={`p-1.5 sm:p-2 rounded-lg ${isAllPending ? 'opacity-50 cursor-not-allowed' : 'bg-white hover:bg-slate-200 shadow-sm border border-slate-200'}`}><RotateCcw size={15}/></button>
                              <button onClick={() => handleMasterAction('pass')} className={`p-1.5 sm:p-2 rounded-lg ${isAllPassed ? 'bg-emerald-500 text-white shadow-md' : 'bg-white hover:bg-emerald-50 text-slate-400 border border-slate-200'}`}><Check size={15}/></button>
                              <button onClick={() => handleMasterAction('fail')} className={`p-1.5 sm:p-2 rounded-lg ${isAllFailed ? 'bg-[#e9272e] text-white shadow-md' : 'bg-white hover:bg-[#e9272e]/10 hover:text-[#e9272e] text-slate-400 border border-slate-200'}`}><X size={15}/></button>
                            </div>
                          </div>
                        </div>

                        {/* Responsive Timeline line adjusted for mobile viewports */}
                        <div className="relative border-l-2 border-[#084e8d]/20 pl-5 sm:pl-8 ml-2 sm:ml-4 space-y-6">
                          <div className="relative"><div className="absolute -left-[27px] sm:-left-[41px] top-4 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-[#084e8d] rounded-full ring-4 ring-white shadow-sm"></div><StepRow label="Step 1: Profile Evaluation & Counseling" stepKey={allSteps[0]} isLocked={checkIsLocked(0)} activeStudent={activeStudent} onAction={handleStepAction} /></div>
                          <div className="relative"><div className="absolute -left-[27px] sm:-left-[41px] top-4 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-[#084e8d] rounded-full ring-4 ring-white shadow-sm"></div><StepRow label="Step 2: Document Verification & Audit" stepKey={allSteps[1]} isLocked={checkIsLocked(1)} activeStudent={activeStudent} onAction={handleStepAction} /></div>
                          <div className="relative"><div className="absolute -left-[27px] sm:-left-[41px] top-4 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-[#084e8d] rounded-full ring-4 ring-white shadow-sm"></div><StepRow label="Step 3: VFS Dossier Preparation" stepKey={allSteps[2]} isLocked={checkIsLocked(2)} activeStudent={activeStudent} onAction={handleStepAction} /></div>
                          <div className="relative"><div className="absolute -left-[27px] sm:-left-[41px] top-4 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-[#084e8d] rounded-full ring-4 ring-white shadow-sm"></div><StepRow label="Step 4: VFS Submission & Biometrics" stepKey={allSteps[3]} isLocked={checkIsLocked(3)} hasDateInput={true} activeStudent={activeStudent} onAction={handleStepAction} onChange={handleExtraFieldChange} /></div>
                          <div className="relative"><div className="absolute -left-[27px] sm:-left-[41px] top-4 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-[#084e8d] rounded-full ring-4 ring-white shadow-sm"></div><StepRow label="Step 5: CVU Interview Phase" stepKey={allSteps[4]} isLocked={checkIsLocked(4)} hasDateInput={true} activeStudent={activeStudent} onAction={handleStepAction} onChange={handleExtraFieldChange} /></div>
                          <div className="relative"><div className="absolute -left-[27px] sm:-left-[41px] top-4 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-[#084e8d] rounded-full ring-4 ring-white shadow-sm"></div><StepRow label="Step 6: Final Visa Approval Status" stepKey={allSteps[5]} isLocked={checkIsLocked(5)} activeStudent={activeStudent} onAction={handleStepAction} /></div>
                          <div className="relative"><div className="absolute -left-[27px] sm:-left-[41px] top-4 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-[#084e8d] rounded-full ring-4 ring-white shadow-sm"></div><StepRow label="Step 7: Pre-Departure & Travel Setup" stepKey={allSteps[6]} isLocked={checkIsLocked(6)} hasDateInput={true} activeStudent={activeStudent} onAction={handleStepAction} onChange={handleExtraFieldChange} /></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 sm:py-20 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-300">
                <div className="bg-white h-16 w-16 rounded-full flex items-center justify-center mx-auto shadow-sm mb-4">
                  <Search className="h-8 w-8 text-[#084e8d]/70" />
                </div>
                <h3 className="text-base font-bold text-slate-800">No Profile Active</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">Use the search bar above to fetch an application ID and access the complete workspace engine.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}