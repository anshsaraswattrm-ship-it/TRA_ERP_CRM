import { useState, useEffect } from 'react';
import { Check, X, Search, UserPlus, Milestone, RotateCcw, UploadCloud, FileText, Trash2, FolderOpen, BookOpen, CreditCard, Lock, Activity, User, Phone, Mail } from 'lucide-react';

// --- Reusable StepRow Component ---
const StepRow = ({ 
  label, stepKey, activeStudent, isSubStep = false, isPayment = false, hasDateInput = false, isLocked = false, onAction, onChange, onFileUpload, onFileDelete
}) => {
  const stepData = activeStudent?.progress?.[stepKey];
  const isPass = stepData?.status === 'pass';
  const isFail = stepData?.status === 'fail';

  return (
    <div className={`relative flex flex-col p-5 mb-4 rounded-xl border transition-all duration-300 ${
      isLocked ? 'bg-slate-50/50 border-slate-200/50 opacity-60' :
      isPass ? 'bg-emerald-50/60 border-emerald-200 shadow-sm' : 
      isFail ? 'bg-[#e9272e]/5 border-[#e9272e]/20 shadow-sm' : 
      'bg-white border-slate-200 shadow-md shadow-slate-200/40 hover:border-[#084e8d]/40 hover:shadow-lg hover:shadow-[#084e8d]/10'
    }`}>
      <div className={isLocked ? 'pointer-events-none' : ''}>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h4 className={`font-semibold flex items-center gap-2 ${isSubStep ? 'text-[14px] text-slate-700' : 'text-[15px] text-slate-800'}`}>
              {isLocked && <Lock size={14} className="text-slate-400" />}
              {label}
            </h4>
            <span className={`text-xs mt-1.5 font-medium ${isPass ? 'text-emerald-600' : isFail ? 'text-[#e9272e]' : 'text-slate-400'}`}>
              {isLocked ? 'Locked (Complete previous step)' : stepData?.date ? `Updated on: ${stepData.date}` : 'Action Pending'}
            </span>
          </div>
          
          <div className="flex gap-2">
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
          <div className="mt-4 pt-4 border-t border-slate-200/70 grid grid-cols-1 sm:grid-cols-4 gap-4">
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
                    <button onClick={() => onFileDelete(stepKey)} className="text-[#e9272e]/70 hover:text-[#e9272e] bg-white p-1 rounded border border-[#e9272e]/20"><Trash2 size={12} /></button>
                  </div>
                ) : (
                  <label className="cursor-pointer w-full h-full flex items-center justify-center bg-slate-50 hover:bg-[#084e8d]/5 border border-dashed border-slate-300 rounded-lg transition-colors group">
                    <UploadCloud size={14} className="text-slate-400 mr-2" />
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
            <div className="w-1/3 min-w-[200px]">
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
    <div className="w-full bg-slate-50/50 min-h-screen pb-12 relative">
      
      {/* 1. STICKY TOP HEADER */}
      {/* PERFECT HEIGHT FIX: Strictly set to h-[90px] */}
      <div className="sticky top-0 z-50 bg-slate-50 border-b border-slate-200 shadow-sm px-4 sm:px-6 lg:px-8 h-[90px] flex flex-col justify-center w-full">
        <h2 className="text-3xl font-extrabold text-[#084e8d] tracking-tight">Student CRM Pipeline</h2>
        <p className="text-sm text-slate-500 mt-1">Manage onboarding, financial ledgers, and milestone tracking seamlessly.</p>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 pt-6">
        {/* Registration Form (Scrolls normally) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 mb-8 overflow-hidden relative z-10">
          <div className="bg-gradient-to-r from-[#084e8d]/5 to-white px-6 py-4 border-b border-slate-100 flex items-center">
            <div className="bg-[#084e8d]/10 p-2 rounded-lg mr-3">
              <UserPlus className="text-[#084e8d]" size={18} />
            </div>
            <h3 className="text-[15px] font-bold text-slate-800 uppercase tracking-wider">New Application Setup</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <button className="bg-[#084e8d] text-white px-8 py-2.5 rounded-lg text-sm font-bold hover:bg-[#063a6b] shadow-lg shadow-[#084e8d]/20 transition-all transform hover:-translate-y-0.5">
                Initialize Profile
              </button>
            </div>
          </div>
        </div>

        {/* 2. Workspace Engine (Master Container) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 flex flex-col relative z-20">
          
          {/* 2A. NORMAL WORKSPACE HEADER & SEARCH (Removed sticky class) */}
          <div className="bg-white rounded-t-2xl border-b border-slate-200">
            <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-slate-100 flex items-center rounded-t-2xl">
              <div className="bg-slate-200/50 p-2 rounded-lg mr-3">
                <Activity className="text-slate-700" size={18} />
              </div>
              <h3 className="text-[15px] font-bold text-slate-800 uppercase tracking-wider">Active Workspace</h3>
            </div>
            
            <div className="p-4 sm:px-8 sm:py-5">
              <div className="flex gap-4 w-full bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Enter Application ID (e.g. APP-1001) to fetch record..." 
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-12 block w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#084e8d]/20 focus:border-[#084e8d] transition-all outline-none shadow-sm"
                  />
                </div>
                <button 
                  onClick={handleSearch}
                  className="bg-slate-900 text-white px-10 py-3 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-md hover:shadow-lg"
                >
                  Fetch Data
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="p-8 relative">
            {activeStudent ? (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in duration-500 items-start">
                
                {/* 3. STICKY STUDENT PROFILE CARD */}
                {/* Sticks perfectly right below the 90px main header (top-[114px] including spacing) */}
                <div className="lg:col-span-1 sticky top-[114px] z-30">
                  <div className="bg-[#084e8d]/5 rounded-2xl p-6 border border-[#084e8d]/20 shadow-sm">
                    <div className="w-16 h-16 bg-[#084e8d]/10 rounded-full flex items-center justify-center mb-4">
                      <User size={32} className="text-[#084e8d]" />
                    </div>
                    <h4 className="text-xl font-extrabold text-slate-800 mb-1">{activeStudent?.name || 'Applicant'}</h4>
                    <p className="text-sm font-bold text-[#084e8d] mb-6">{activeStudent?.id || 'N/A'}</p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center text-sm text-slate-600">
                        <Phone size={16} className="text-slate-400 mr-3" /> {activeStudent?.phone || 'No phone'}
                      </div>
                      <div className="flex items-center text-sm text-slate-600 break-all">
                        <Mail size={16} className="text-slate-400 mr-3" /> {activeStudent?.email || 'No email'}
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <span className="font-bold text-slate-400 mr-3 text-xs uppercase tracking-widest">CITY</span> {activeStudent?.city || 'Not specified'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Tabs & Main Content (This side scrolls normally) */}
                <div className="lg:col-span-3">
                  <div className="flex bg-slate-100 p-1.5 rounded-xl w-full sm:w-fit mb-6 overflow-x-auto">
                    <button onClick={() => setActiveTab('pipeline')} className={`flex items-center px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'pipeline' ? 'bg-white text-[#084e8d] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                      <Milestone size={16} className="mr-2" /> Workflow
                    </button>
                    <button onClick={() => setActiveTab('payments')} className={`flex items-center px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'payments' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                      <CreditCard size={16} className="mr-2" /> Payments
                    </button>
                    <button onClick={() => setActiveTab('vault')} className={`flex items-center px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'vault' ? 'bg-white text-[#084e8d] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                      <FolderOpen size={16} className="mr-2" /> Vault
                    </button>
                    <button onClick={() => setActiveTab('academic')} className={`flex items-center px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'academic' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                      <BookOpen size={16} className="mr-2" /> Academics
                    </button>
                  </div>

                  {/* --- TAB CONTENT RENDERER --- */}
                  <div className="mt-2">
                    
                    {/* 1. DOCUMENT VAULT TAB */}
                    {activeTab === 'vault' && (
                      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
                        <div className="flex items-center mb-6">
                          <div className="bg-[#084e8d]/10 p-2 rounded-lg mr-3"><FolderOpen className="text-[#084e8d]" size={18} /></div>
                          <h4 className="font-bold text-slate-800 text-lg">Student Document Vault</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          {documentSlots.map((slot) => {
                            const docData = activeStudent.documents?.[slot.key];
                            const isUploaded = !!docData;
                            return (
                              <div key={slot.key} className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex items-center gap-2.5">
                                    <FileText size={18} className={`${isUploaded ? 'text-emerald-500' : 'text-slate-400'}`} />
                                    <span className="font-semibold text-sm text-slate-700">{slot.label}</span>
                                  </div>
                                  {isUploaded && <Check size={18} className="text-emerald-500" strokeWidth={3} />}
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
                      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
                        <div className="flex items-center mb-6">
                          <div className="bg-orange-100 p-2 rounded-lg mr-3"><BookOpen className="text-orange-600" size={18} /></div>
                          <h4 className="font-bold text-slate-800 text-lg">Academic Details</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                      <div className="bg-slate-900 rounded-2xl p-6 shadow-lg shadow-slate-900/10 animate-in slide-in-from-bottom-2 fade-in duration-300">
                        <div className="flex items-center mb-6">
                          <div className="bg-emerald-500/20 p-2 rounded-lg mr-3 border border-emerald-500/30"><CreditCard className="text-emerald-400" size={18} /></div>
                          <h4 className="font-bold text-white text-lg tracking-wide">Financial & Payment Ledger</h4>
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
                      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center">
                            <div className="bg-[#084e8d]/10 p-2 rounded-lg mr-3"><Milestone className="text-[#084e8d]" size={18} /></div>
                            <h4 className="font-bold text-slate-800 text-lg">Visa & Application Workflow</h4>
                          </div>
                          <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shadow-inner">
                            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest hidden sm:block">Master Override:</span>
                            <div className="flex gap-1.5">
                              <button onClick={() => handleMasterAction('pending')} disabled={isAllPending} className={`p-2 rounded-lg ${isAllPending ? 'opacity-50 cursor-not-allowed' : 'bg-white hover:bg-slate-200 shadow-sm border border-slate-200'}`}><RotateCcw size={16}/></button>
                              <button onClick={() => handleMasterAction('pass')} className={`p-2 rounded-lg ${isAllPassed ? 'bg-emerald-500 text-white shadow-md' : 'bg-white hover:bg-emerald-50 text-slate-400 border border-slate-200'}`}><Check size={16}/></button>
                              <button onClick={() => handleMasterAction('fail')} className={`p-2 rounded-lg ${isAllFailed ? 'bg-[#e9272e] text-white shadow-md' : 'bg-white hover:bg-[#e9272e]/10 hover:text-[#e9272e] text-slate-400 border border-slate-200'}`}><X size={16}/></button>
                            </div>
                          </div>
                        </div>

                        <div className="relative border-l-2 border-[#084e8d]/20 pl-8 ml-4 space-y-6">
                          <div className="relative"><div className="absolute -left-[41px] top-4 w-4 h-4 bg-[#084e8d] rounded-full ring-4 ring-white shadow-sm"></div><StepRow label="Step 1: Profile Evaluation & Counseling" stepKey={allSteps[0]} isLocked={checkIsLocked(0)} activeStudent={activeStudent} onAction={handleStepAction} /></div>
                          <div className="relative"><div className="absolute -left-[41px] top-4 w-4 h-4 bg-[#084e8d] rounded-full ring-4 ring-white shadow-sm"></div><StepRow label="Step 2: Document Verification & Audit" stepKey={allSteps[1]} isLocked={checkIsLocked(1)} activeStudent={activeStudent} onAction={handleStepAction} /></div>
                          <div className="relative"><div className="absolute -left-[41px] top-4 w-4 h-4 bg-[#084e8d] rounded-full ring-4 ring-white shadow-sm"></div><StepRow label="Step 3: VFS Dossier Preparation" stepKey={allSteps[2]} isLocked={checkIsLocked(2)} activeStudent={activeStudent} onAction={handleStepAction} /></div>
                          <div className="relative"><div className="absolute -left-[41px] top-4 w-4 h-4 bg-[#084e8d] rounded-full ring-4 ring-white shadow-sm"></div><StepRow label="Step 4: VFS Submission & Biometrics" stepKey={allSteps[3]} isLocked={checkIsLocked(3)} hasDateInput={true} activeStudent={activeStudent} onAction={handleStepAction} onChange={handleExtraFieldChange} /></div>
                          <div className="relative"><div className="absolute -left-[41px] top-4 w-4 h-4 bg-[#084e8d] rounded-full ring-4 ring-white shadow-sm"></div><StepRow label="Step 5: CVU Interview Phase" stepKey={allSteps[4]} isLocked={checkIsLocked(4)} hasDateInput={true} activeStudent={activeStudent} onAction={handleStepAction} onChange={handleExtraFieldChange} /></div>
                          <div className="relative"><div className="absolute -left-[41px] top-4 w-4 h-4 bg-[#084e8d] rounded-full ring-4 ring-white shadow-sm"></div><StepRow label="Step 6: Final Visa Approval Status" stepKey={allSteps[5]} isLocked={checkIsLocked(5)} activeStudent={activeStudent} onAction={handleStepAction} /></div>
                          <div className="relative"><div className="absolute -left-[41px] top-4 w-4 h-4 bg-[#084e8d] rounded-full ring-4 ring-white shadow-sm"></div><StepRow label="Step 7: Pre-Departure & Travel Setup" stepKey={allSteps[6]} isLocked={checkIsLocked(6)} hasDateInput={true} activeStudent={activeStudent} onAction={handleStepAction} onChange={handleExtraFieldChange} /></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-300">
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































































// import { useState, useEffect } from 'react';
// import { Check, X, Search, UserPlus, Milestone, RotateCcw, UploadCloud, FileText, Trash2, FolderOpen, BookOpen, CreditCard, Lock, Activity, Terminal, Database, Clock } from 'lucide-react';

// // --- Reusable StepRow Component ---
// const StepRow = ({ 
//   label, stepKey, activeStudent, isSubStep = false, isPayment = false, hasDateInput = false, isLocked = false, onAction, onChange, onFileUpload, onFileDelete
// }) => {
//   const stepData = activeStudent?.progress?.[stepKey];
//   const isPass = stepData?.status === 'pass';
//   const isFail = stepData?.status === 'fail';

//   return (
//     <div className={`relative flex flex-col p-4 mb-3 rounded-md border-l-4 transition-all duration-200 ${
//       isLocked ? 'bg-slate-50 border-slate-300 border-l-slate-300 opacity-70' :
//       isPass ? 'bg-emerald-50/30 border-slate-200 border-l-emerald-500 shadow-sm' : 
//       isFail ? 'bg-[#e9272e]/5 border-slate-200 border-l-[#e9272e] shadow-sm' : 
//       'bg-white border-slate-200 border-l-[#084e8d] shadow-sm hover:border-[#084e8d]/40 hover:shadow'
//     }`}>
//       <div className={isLocked ? 'pointer-events-none' : ''}>
//         <div className="flex items-center justify-between">
//           <div className="flex flex-col">
//             <h4 className={`font-bold flex items-center gap-2 ${isSubStep ? 'text-xs text-slate-700' : 'text-sm text-slate-800 uppercase tracking-wide'}`}>
//               {isLocked && <Lock size={12} className="text-slate-400" />}
//               {label}
//             </h4>
//             <span className={`text-[10px] font-mono mt-1 ${isPass ? 'text-emerald-600' : isFail ? 'text-[#e9272e]' : 'text-slate-500'}`}>
//               {isLocked ? 'STATUS: LOCKED_DEP_PENDING' : stepData?.date ? `LAST_SYNC: ${stepData.date}` : 'STATUS: PENDING_ACTION'}
//             </span>
//           </div>
          
//           <div className="flex gap-1.5">
//             <button onClick={() => onAction(stepKey, 'pending')} disabled={!isPass && !isFail} title="Reset Workflow" className={`flex items-center justify-center w-7 h-7 rounded transition-all duration-200 ${(!isPass && !isFail) ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}>
//               <RotateCcw size={12} strokeWidth={3} />
//             </button>
//             <button onClick={() => onAction(stepKey, 'pass')} className={`flex items-center justify-center w-7 h-7 rounded transition-all duration-200 ${isPass ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-emerald-100 hover:text-emerald-600'}`}>
//               <Check size={14} strokeWidth={3} />
//             </button>
//             <button onClick={() => onAction(stepKey, 'fail')} className={`flex items-center justify-center w-7 h-7 rounded transition-all duration-200 ${isFail ? 'bg-[#e9272e] text-white' : 'bg-slate-100 text-slate-400 hover:bg-[#e9272e]/10 hover:text-[#e9272e]'}`}>
//               <X size={14} strokeWidth={3} />
//             </button>
//           </div>
//         </div>

//         {/* Dense Enterprise Inputs for Payments */}
//         {isPayment && (
//           <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded">
//             <div>
//               <label className="block text-[10px] font-bold text-slate-500 uppercase">Amount (INR)</label>
//               <input type="number" placeholder="0.00" value={stepData?.amountINR || ''} onChange={(e) => onChange(stepKey, 'amountINR', e.target.value)} className="mt-1 block w-full px-2 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[#084e8d] outline-none font-mono" />
//             </div>
//             <div>
//               <label className="block text-[10px] font-bold text-slate-500 uppercase">Amount (EUR)</label>
//               <input type="number" placeholder="0.00" value={stepData?.amountEUR || ''} onChange={(e) => onChange(stepKey, 'amountEUR', e.target.value)} className="mt-1 block w-full px-2 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[#084e8d] outline-none font-mono" />
//             </div>
//             <div>
//               <label className="block text-[10px] font-bold text-slate-500 uppercase">Txn Date</label>
//               <input type="date" value={stepData?.transactionDate || ''} onChange={(e) => onChange(stepKey, 'transactionDate', e.target.value)} className="mt-1 block w-full px-2 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[#084e8d] outline-none" />
//             </div>
//             <div>
//               <label className="block text-[10px] font-bold text-slate-500 uppercase">Receipt Document</label>
//               <div className="mt-1 h-[28px]">
//                 {stepData?.receipt ? (
//                   <div className="flex w-full items-center justify-between bg-emerald-50 px-2 py-1 border border-emerald-200 rounded h-full">
//                     <span className="text-[10px] font-semibold text-emerald-700 truncate mr-2">{stepData.receipt.name}</span>
//                     <button onClick={() => onFileDelete(stepKey)} className="text-[#e9272e]/70 hover:text-[#e9272e]"><Trash2 size={12} /></button>
//                   </div>
//                 ) : (
//                   <label className="cursor-pointer w-full h-full flex items-center justify-center bg-white border border-dashed border-slate-300 rounded hover:bg-slate-50">
//                     <UploadCloud size={12} className="text-slate-400 mr-1" />
//                     <span className="text-[10px] font-bold text-slate-500 uppercase">Upload</span>
//                     <input type="file" className="hidden" onChange={(e) => onFileUpload(stepKey, e.target.files[0])} />
//                   </label>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Standalone Date Input */}
//         {!isPayment && hasDateInput && (
//           <div className="mt-3 pt-3 border-t border-slate-100">
//             <div className="w-1/3 min-w-[150px]">
//               <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Scheduled Date</label>
//               <input type="date" value={stepData?.scheduledDate || ''} onChange={(e) => onChange(stepKey, 'scheduledDate', e.target.value)} className="block w-full px-2 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[#084e8d] outline-none" />
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };


// export default function StudentsPipeline() {
//   const [currentDate, setCurrentDate] = useState('');
//   const [searchInput, setSearchInput] = useState('');
//   const [activeStudent, setActiveStudent] = useState(null);
//   const [activeTab, setActiveTab] = useState('pipeline');

//   const allSteps = ['counselling', 'documentation', 'vfs_docs', 'vfs_submission', 'cvu_interview', 'visa_status', 'flight_tickets'];
//   const documentSlots = [
//     { key: 'passport', label: 'Passport (Front & Back)' },
//     { key: 'academics', label: 'Academic Transcripts' },
//     { key: 'financials', label: 'Bank Statements' },
//     { key: 'offer_letter', label: 'College/University Offer Letter' },
//     { key: 'photo', label: 'Student Photo' },
//     { key: 'lor_moi', label: 'LOR / MOI' }
//   ];

//   useEffect(() => {
//     const today = new Date().toISOString().split('T')[0];
//     setCurrentDate(today);
//   }, []);

//   const handleStepAction = (stepKey, statusValue) => {
//     const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
//     setActiveStudent(prev => ({
//       ...prev, progress: { ...prev.progress, [stepKey]: { ...prev.progress?.[stepKey], status: statusValue, date: statusValue === 'pending' ? null : todayStr } }
//     }));
//   };

//   const handleMasterAction = (statusValue) => {
//     const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
//     const newProgress = { ...activeStudent?.progress }; 
//     allSteps.forEach(step => {
//       newProgress[step] = { ...newProgress[step], status: statusValue, date: statusValue === 'pending' ? null : todayStr };
//     });
//     setActiveStudent(prev => ({ ...prev, progress: newProgress }));
//   };

//   const handleExtraFieldChange = (stepKey, field, value) => {
//     setActiveStudent(prev => ({ ...prev, progress: { ...prev.progress, [stepKey]: { ...(prev.progress?.[stepKey] || { status: 'pending' }), [field]: value } } }));
//   };

//   const handlePaymentFileUpload = (stepKey, file) => {
//     if (!file) return;
//     setActiveStudent(prev => ({ ...prev, progress: { ...prev.progress, [stepKey]: { ...(prev.progress?.[stepKey] || { status: 'pending' }), receipt: { name: file.name } } } }));
//   };

//   const handlePaymentFileDelete = (stepKey) => {
//     setActiveStudent(prev => {
//       const stepData = { ...prev.progress?.[stepKey] };
//       delete stepData.receipt;
//       return { ...prev, progress: { ...prev.progress, [stepKey]: stepData } };
//     });
//   };

//   const handleFileUpload = (docKey, file) => {
//     if (!file) return;
//     const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
//     setActiveStudent(prev => ({ ...prev, documents: { ...(prev.documents || {}), [docKey]: { name: file.name, date: todayStr } } }));
//   };

//   const handleDeleteFile = (docKey) => {
//     setActiveStudent(prev => {
//       const newDocs = { ...prev.documents };
//       delete newDocs[docKey];
//       return { ...prev, documents: newDocs };
//     });
//   };

//   const handleDetailChange = (field, value) => {
//     setActiveStudent(prev => ({ ...prev, details: { ...(prev.details || {}), [field]: value } }));
//   };

//   const handleSearch = () => {
//     if (searchInput.trim() === '') return;
//     setActiveStudent({ id: searchInput, progress: {}, documents: {}, details: { intake: '', college: '' } });
//     setActiveTab('pipeline');
//   };

//   const checkIsLocked = (index) => {
//     if (index === 0) return false; 
//     const prevStepKey = allSteps[index - 1];
//     return activeStudent?.progress?.[prevStepKey]?.status !== 'pass';
//   };

//   const isAllPassed = activeStudent ? allSteps.every(step => activeStudent.progress?.[step]?.status === 'pass') : false;
//   const isAllFailed = activeStudent ? allSteps.every(step => activeStudent.progress?.[step]?.status === 'fail') : false;
//   const isAllPending = activeStudent ? allSteps.every(step => !activeStudent.progress?.[step]?.status || activeStudent.progress?.[step]?.status === 'pending') : false;

//   return (
//     <div className="w-full mx-auto pb-12 px-2">
      
//       {/* Enterprise Top Stats Ribbon */}
//       <div className="grid grid-cols-4 gap-4 mb-6">
//         <div className="bg-white border border-slate-300 p-3 rounded-md shadow-sm">
//           <p className="text-[10px] font-bold text-slate-500 uppercase">System Status</p>
//           <p className="text-sm font-bold text-emerald-600 flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span> ONLINE & SYNCED</p>
//         </div>
//         <div className="bg-white border border-slate-300 p-3 rounded-md shadow-sm">
//           <p className="text-[10px] font-bold text-slate-500 uppercase">Active Pipelines</p>
//           <p className="text-sm font-bold text-[#084e8d] font-mono">1,248 Records</p>
//         </div>
//         <div className="bg-white border border-slate-300 p-3 rounded-md shadow-sm">
//           <p className="text-[10px] font-bold text-slate-500 uppercase">Pending Audits</p>
//           <p className="text-sm font-bold text-orange-600 font-mono">14 Requires Action</p>
//         </div>
//         <div className="bg-white border border-slate-300 p-3 rounded-md shadow-sm">
//           <p className="text-[10px] font-bold text-slate-500 uppercase">Server Time (IST)</p>
//           <p className="text-sm font-bold text-slate-800 font-mono">{new Date().toLocaleTimeString()}</p>
//         </div>
//       </div>

//       {/* 1. Registration Form (Dense Grid) */}
//       <div className="bg-white rounded-md shadow-sm border border-slate-300 mb-6 overflow-hidden">
//         <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
//           <div className="flex items-center">
//             <UserPlus className="text-slate-400 mr-2" size={14} />
//             <h3 className="text-xs font-bold text-white uppercase tracking-widest">New Application Data Entry</h3>
//           </div>
//           <span className="text-[10px] text-slate-400 font-mono">MODULE: REG_001</span>
//         </div>
//         <div className="p-4 bg-slate-50">
//           <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
//             <div>
//               <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Application ID (Auto)</label>
//               <input type="text" placeholder="APP-XXXX" className="w-full px-2 py-1.5 border border-slate-300 rounded shadow-inner text-xs font-mono focus:ring-1 focus:ring-[#084e8d] outline-none" />
//             </div>
//             <div>
//               <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Reg Date</label>
//               <input type="date" value={currentDate} readOnly className="w-full px-2 py-1.5 bg-slate-200 border border-slate-300 rounded text-xs font-mono text-slate-600 cursor-not-allowed" />
//             </div>
//             <div className="md:col-span-2">
//               <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Applicant Legal Name</label>
//               <input type="text" placeholder="As per Passport" className="w-full px-2 py-1.5 border border-slate-300 rounded shadow-inner text-xs focus:ring-1 focus:ring-[#084e8d] outline-none" />
//             </div>
//             <div>
//               <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Executive Mapping</label>
//               <select className="w-full px-2 py-1.5 border border-slate-300 rounded shadow-inner text-xs focus:ring-1 focus:ring-[#084e8d] outline-none bg-white">
//                 <option value="">Select Resource</option>
//                 <option>EMP-001 (Aman)</option>
//                 <option>EMP-002 (Rahul)</option>
//               </select>
//             </div>
//           </div>
//           <div className="mt-4 flex justify-end">
//             <button className="bg-[#084e8d] text-white px-6 py-1.5 rounded text-xs font-bold hover:bg-[#063a6b] transition-colors flex items-center">
//               <Database size={12} className="mr-1.5"/> Execute Record Creation
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* 2. Workspace Engine */}
//       <div className="bg-white rounded-md shadow-sm border border-slate-300 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
//         {/* LEFT PANEL: Search & Sidebar Logs (Simulated) */}
//         <div className="w-full md:w-80 bg-slate-50 border-r border-slate-300 flex flex-col">
//           <div className="p-4 border-b border-slate-300 bg-white">
//             <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Retrieve Application Data</label>
//             <div className="flex">
//               <input 
//                 type="text" 
//                 placeholder="APP-ID..." 
//                 value={searchInput}
//                 onChange={(e) => setSearchInput(e.target.value)}
//                 className="flex-1 px-3 py-2 border border-slate-300 rounded-l text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#084e8d] shadow-inner"
//               />
//               <button onClick={handleSearch} className="bg-slate-800 text-white px-3 py-2 rounded-r text-xs font-bold hover:bg-slate-900 transition-colors">
//                 QUERY
//               </button>
//             </div>
//           </div>
          
//           {/* Mock Recent Logs Panel to make it look dense */}
//           <div className="flex-1 p-4 overflow-y-auto">
//             <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center"><Clock size={12} className="mr-1"/> Recent System Commits</h4>
//             <div className="space-y-2">
//               <div className="bg-white p-2 rounded border border-slate-200 shadow-sm">
//                 <p className="text-[10px] text-slate-800 font-mono">APP-1029 <span className="text-emerald-600 font-bold">UPDATED</span></p>
//                 <p className="text-[9px] text-slate-500 mt-0.5">Stage: Visa Approval - PASS</p>
//               </div>
//               <div className="bg-white p-2 rounded border border-slate-200 shadow-sm">
//                 <p className="text-[10px] text-slate-800 font-mono">APP-1025 <span className="text-[#084e8d] font-bold">DOC_UPLOAD</span></p>
//                 <p className="text-[9px] text-slate-500 mt-0.5">Passport scan attached by EMP-002</p>
//               </div>
//               <div className="bg-white p-2 rounded border border-slate-200 shadow-sm">
//                 <p className="text-[10px] text-slate-800 font-mono">APP-1033 <span className="text-[#e9272e] font-bold">FAILED</span></p>
//                 <p className="text-[9px] text-slate-500 mt-0.5">Stage: CVU Interview - REJECTED</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* RIGHT PANEL: Data / Empty State */}
//         <div className="flex-1 bg-slate-100/50 p-4 lg:p-6 overflow-y-auto">
//           {activeStudent ? (
//             <div className="w-full animate-in fade-in duration-300">
              
//               <div className="pb-4 mb-4 border-b border-slate-300 flex flex-col md:flex-row md:items-end justify-between gap-4">
//                 <div>
//                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Record Pointer</p>
//                   <h4 className="text-2xl font-black text-slate-800 font-mono mt-1">{activeStudent.id}</h4>
//                 </div>
                
//                 {/* Denser Tabs */}
//                 <div className="flex bg-slate-200/70 p-1 rounded-md border border-slate-300">
//                   <button onClick={() => setActiveTab('pipeline')} className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${activeTab === 'pipeline' ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>WORKFLOW</button>
//                   <button onClick={() => setActiveTab('payments')} className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${activeTab === 'payments' ? 'bg-white text-emerald-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>LEDGER</button>
//                   <button onClick={() => setActiveTab('vault')} className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${activeTab === 'vault' ? 'bg-white text-[#084e8d] shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>DATA_VAULT</button>
//                   <button onClick={() => setActiveTab('academic')} className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${activeTab === 'academic' ? 'bg-white text-orange-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>ACADEMICS</button>
//                 </div>
//               </div>

//               {/* --- TAB CONTENT RENDERER --- */}
//               <div className="mt-4">
                
//                 {/* 1. DOCUMENT VAULT TAB */}
//                 {activeTab === 'vault' && (
//                   <div className="bg-white border border-slate-300 shadow-sm rounded-md p-5 animate-in fade-in">
//                     <h4 className="font-bold text-slate-800 text-sm uppercase mb-4 border-b border-slate-100 pb-2">Document Repository</h4>
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                       {documentSlots.map((slot) => {
//                         const docData = activeStudent.documents?.[slot.key];
//                         const isUploaded = !!docData;
//                         return (
//                           <div key={slot.key} className="bg-slate-50 border border-slate-200 rounded p-3 flex flex-col justify-between">
//                             <div className="flex items-start justify-between mb-3">
//                               <span className="font-bold text-xs text-slate-700 uppercase">{slot.label}</span>
//                               {isUploaded && <Check size={14} className="text-emerald-500" strokeWidth={3} />}
//                             </div>
//                             {isUploaded ? (
//                               <div className="bg-emerald-50/50 rounded p-2 border border-emerald-100">
//                                 <p className="text-[10px] text-slate-800 font-bold truncate font-mono" title={docData.name}>{docData.name}</p>
//                                 <div className="flex justify-between items-center mt-2 pt-2 border-t border-emerald-100/50">
//                                   <span className="text-[9px] text-slate-500 font-mono">{docData.date}</span>
//                                   <button onClick={() => handleDeleteFile(slot.key)} className="text-[#e9272e] hover:bg-[#e9272e]/10 p-1 rounded"><Trash2 size={12} /></button>
//                                 </div>
//                               </div>
//                             ) : (
//                               <label className="cursor-pointer bg-white border border-dashed border-slate-300 rounded py-2 text-center hover:bg-slate-100 mt-auto">
//                                 <span className="text-[10px] font-bold text-slate-500 uppercase flex justify-center items-center"><UploadCloud size={12} className="mr-1"/> Attach File</span>
//                                 <input type="file" className="hidden" onChange={(e) => handleFileUpload(slot.key, e.target.files[0])} />
//                               </label>
//                             )}
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 )}

//                 {/* 2. ACADEMIC DETAILS TAB */}
//                 {activeTab === 'academic' && (
//                   <div className="bg-white border border-slate-300 shadow-sm rounded-md p-5 animate-in fade-in">
//                     <h4 className="font-bold text-slate-800 text-sm uppercase mb-4 border-b border-slate-100 pb-2">Academic Parameters</h4>
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target Intake Term</label>
//                         <input type="text" placeholder="e.g. Sep 2026" value={activeStudent.details?.intake || ''} onChange={(e) => handleDetailChange('intake', e.target.value)} className="block w-full px-3 py-2 border border-slate-300 rounded shadow-inner text-xs focus:ring-1 focus:ring-[#084e8d] outline-none" />
//                       </div>
//                       <div>
//                         <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Assigned Institution</label>
//                         <input type="text" placeholder="e.g. University of Malta" value={activeStudent.details?.college || ''} onChange={(e) => handleDetailChange('college', e.target.value)} className="block w-full px-3 py-2 border border-slate-300 rounded shadow-inner text-xs focus:ring-1 focus:ring-[#084e8d] outline-none" />
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* 3. FINANCIAL & PAYMENT LEDGER TAB */}
//                 {activeTab === 'payments' && (
//                   <div className="bg-slate-900 rounded-md p-5 border border-slate-800 shadow-lg animate-in fade-in">
//                     <h4 className="font-bold text-white text-sm uppercase mb-4 border-b border-slate-700 pb-2 flex items-center"><CreditCard size={14} className="mr-2 text-emerald-400"/> Primary Ledger</h4>
//                     <div className="space-y-3">
//                       <StepRow label="FEE_TRX: Application Charge" stepKey="app_fee" isPayment={true} activeStudent={activeStudent} onAction={handleStepAction} onChange={handleExtraFieldChange} onFileUpload={handlePaymentFileUpload} onFileDelete={handlePaymentFileDelete} />
//                       <StepRow label="FEE_TRX: Stage 1 Setup" stepKey="stage_1" isPayment={true} activeStudent={activeStudent} onAction={handleStepAction} onChange={handleExtraFieldChange} onFileUpload={handlePaymentFileUpload} onFileDelete={handlePaymentFileDelete} />
//                       <StepRow label="FEE_TRX: Stage 2 Consultation" stepKey="stage_2" isPayment={true} activeStudent={activeStudent} onAction={handleStepAction} onChange={handleExtraFieldChange} onFileUpload={handlePaymentFileUpload} onFileDelete={handlePaymentFileDelete} />
//                       <StepRow label="FEE_TRX: Tuition Wire Transfer" stepKey="tuition_fee" isPayment={true} activeStudent={activeStudent} onAction={handleStepAction} onChange={handleExtraFieldChange} onFileUpload={handlePaymentFileUpload} onFileDelete={handlePaymentFileDelete} />
//                     </div>
//                   </div>
//                 )}

//                 {/* 4. SEQUENTIAL MILESTONE PIPELINE TAB */}
//                 {activeTab === 'pipeline' && (
//                   <div className="bg-white border border-slate-300 shadow-sm rounded-md p-5 animate-in fade-in">
//                     <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-3">
//                       <h4 className="font-bold text-slate-800 text-sm uppercase">Operation Sequence</h4>
                      
//                       <div className="flex items-center gap-3">
//                         <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">SYS_OVERRIDE</span>
//                         <div className="flex gap-1">
//                           <button onClick={() => handleMasterAction('pending')} disabled={isAllPending} className="p-1.5 bg-slate-100 border border-slate-300 rounded hover:bg-slate-200"><RotateCcw size={12}/></button>
//                           <button onClick={() => handleMasterAction('pass')} className="p-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded hover:bg-emerald-100"><Check size={12}/></button>
//                           <button onClick={() => handleMasterAction('fail')} className="p-1.5 bg-rose-50 text-[#e9272e] border border-rose-200 rounded hover:bg-rose-100"><X size={12}/></button>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="space-y-0">
//                       <StepRow label="SEQ_01: Profile Evaluation & Audit" stepKey={allSteps[0]} isLocked={checkIsLocked(0)} activeStudent={activeStudent} onAction={handleStepAction} />
//                       <StepRow label="SEQ_02: Base Documentation Check" stepKey={allSteps[1]} isLocked={checkIsLocked(1)} activeStudent={activeStudent} onAction={handleStepAction} />
//                       <StepRow label="SEQ_03: VFS Dossier Compilation" stepKey={allSteps[2]} isLocked={checkIsLocked(2)} activeStudent={activeStudent} onAction={handleStepAction} />
//                       <StepRow label="SEQ_04: VFS Biometrics & Submission" stepKey={allSteps[3]} isLocked={checkIsLocked(3)} hasDateInput={true} activeStudent={activeStudent} onAction={handleStepAction} onChange={handleExtraFieldChange} />
//                       <StepRow label="SEQ_05: Core CVU Interview" stepKey={allSteps[4]} isLocked={checkIsLocked(4)} hasDateInput={true} activeStudent={activeStudent} onAction={handleStepAction} onChange={handleExtraFieldChange} />
//                       <StepRow label="SEQ_06: Embassy Decision Protocol" stepKey={allSteps[5]} isLocked={checkIsLocked(5)} activeStudent={activeStudent} onAction={handleStepAction} />
//                       <StepRow label="SEQ_07: Transit & Deployment Setup" stepKey={allSteps[6]} isLocked={checkIsLocked(6)} hasDateInput={true} activeStudent={activeStudent} onAction={handleStepAction} onChange={handleExtraFieldChange} />
//                     </div>
//                   </div>
//                 )}
                
//               </div>
//             </div>
//           ) : (
//             <div className="h-full flex flex-col items-center justify-center text-center py-10 px-4">
//               <div className="bg-slate-200 p-4 rounded-full mb-4">
//                 <Terminal className="h-10 w-10 text-slate-500" />
//               </div>
//               <h3 className="text-lg font-bold text-slate-800 uppercase tracking-widest">Awaiting Query Input</h3>
//               <p className="text-xs text-slate-500 mt-2 max-w-sm font-mono">System idle. Please execute a query using an Application ID in the left console to load a record into the workspace.</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }