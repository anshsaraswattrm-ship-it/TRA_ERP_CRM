import { useState, useEffect } from 'react';
import { Search, FileText, UploadCloud, Check, Trash2, FolderOpen, UserCheck, Shield, Loader2, CheckCircle, AlertCircle, Eye, Lock, Info } from 'lucide-react'; // 🔥 'Info' icon add kiya hai

export default function EmployeeDocuments() {
  const [searchInput, setSearchInput] = useState('');
  const [activeEmployee, setActiveEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({}); 
  const [popup, setPopup] = useState({ show: false, type: '', message: '' });

  const API_BASE_URL = 'https://tra-erp-crm.onrender.com/api';

  // --- ROLE BASED ACCESS CONTROL (RBAC) ---
  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
  const userRole = userInfo.role || '';
  
  const isSuperAdmin = userRole === 'Super Admin';
  const isManagement = ['Founder and Director', 'Founder', 'Manager', 'Receptionist', 'Reception'].includes(userRole);
  
  const canSearch = isSuperAdmin || isManagement;
  const canUploadDelete = isSuperAdmin;

  const documentSlots = [
    { key: 'photo', label: 'Employee Photograph' },
    { key: 'resume', label: 'Updated Resume / CV' },
    { key: 'id_proof', label: 'Government ID (Aadhaar/Passport)' },
    { key: 'pan_card', label: 'PAN Card' },
    { key: 'offer_letter', label: 'Signed Offer Letter' },
    { key: 'bank_details', label: 'Bank Passbook / Cancelled Cheque' },
    { key: 'relieving_letter', label: (
      <>
        Relieving / Experience Letter
        <br />
        <span className="text-[11px] text-slate-500 font-normal leading-tight mt-1 inline-block">
          Note: If you have both Relieving and Experience letters, please merge them into a single PDF. Otherwise, upload your single document.
        </span>
      </>
    )}
  ];

  const showPopup = (type, message) => {
    setPopup({ show: true, type, message });
    setTimeout(() => setPopup({ show: false, type: '', message: '' }), 3000);
  };

  // Auto-fetch for regular employees on mount
  useEffect(() => {
    if (!canSearch && userInfo._id) {
      fetchEmployeeData(''); 
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Handlers ---
  const fetchEmployeeData = async (queryId) => {
    setLoading(true);
    setActiveEmployee(null);

    try {
      const res = await fetch(`${API_BASE_URL}/documents/fetch-records`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}` 
        },
        body: JSON.stringify({ queryId: queryId || '' })
      });
      
      const data = await res.json();

      if (!res.ok) {
        showPopup('error', data.message || 'No employee found with this ID.');
        setLoading(false);
        return;
      }

      const { user, documents } = data;

      const mappedDocs = {};
      if (Array.isArray(documents)) {
        documents.forEach(doc => {
          mappedDocs[doc.documentType] = {
            _id: doc._id,
            name: doc.fileUrl.split('/').pop().substring(0, 20) + '...', 
            date: new Date(doc.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            url: doc.fileUrl
          };
        });
      }

      setActiveEmployee({
        _id: user._id,
        id: user.employeeId,
        name: user.name,
        role: user.role,
        documents: mappedDocs 
      });

    } catch (error) {
      showPopup('error', 'Server error while fetching records.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchClick = () => {
    if (!searchInput.trim()) {
      showPopup('error', 'Please enter an exact Employee ID');
      return;
    }
    fetchEmployeeData(searchInput.trim());
  };

  const handleFileUpload = async (docKey, file) => {
    if (!file || !activeEmployee || !canUploadDelete) return;
    
    if (file.size > 5 * 1024 * 1024) {
      showPopup('error', 'File size must be less than 5MB.');
      return;
    }

    setActionLoading(prev => ({ ...prev, [docKey]: true }));

    const formData = new FormData();
    formData.append('file', file);
    formData.append('employeeId', activeEmployee._id);
    formData.append('documentType', docKey);

    try {
      const res = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userInfo.token}` },
        body: formData
      });
      
      const data = await res.json();

      if (res.ok) {
        showPopup('success', 'Document uploaded & secured!');
        setActiveEmployee(prev => ({
          ...prev,
          documents: {
            ...prev.documents,
            [docKey]: { 
              _id: data.doc._id,
              name: file.name, 
              date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
              url: data.doc.fileUrl
            }
          }
        }));
      } else {
        showPopup('error', data.message || 'Upload failed.');
      }
    } catch (error) {
      showPopup('error', 'Network error during upload.');
    } finally {
      setActionLoading(prev => ({ ...prev, [docKey]: false }));
    }
  };

  const handleDeleteFile = async (docKey, docId) => {
    if(!canUploadDelete) return;
    if(!window.confirm("Are you sure you want to permanently delete this document?")) return;

    setActionLoading(prev => ({ ...prev, [docKey]: true }));

    try {
      const res = await fetch(`${API_BASE_URL}/documents/${docId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });

      if (res.ok) {
        showPopup('success', 'Document deleted successfully.');
        setActiveEmployee(prev => {
          const newDocs = { ...prev.documents };
          delete newDocs[docKey];
          return { ...prev, documents: newDocs };
        });
      } else {
        showPopup('error', 'Failed to delete document.');
      }
    } catch (error) {
      showPopup('error', 'Network error during deletion.');
    } finally {
      setActionLoading(prev => ({ ...prev, [docKey]: false }));
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-12 pt-4 relative overflow-x-hidden">
      
      {/* NOTIFICATION POPUP */}
      {popup.show && (
        <div className="fixed top-20 right-5 z-[60] flex items-center bg-white shadow-xl border border-slate-100 rounded-lg p-4 animate-in slide-in-from-right-8 duration-300">
          {popup.type === 'success' ? <CheckCircle className="text-emerald-500 mr-3" size={24}/> : <AlertCircle className="text-red-500 mr-3" size={24}/>}
          <div>
            <h4 className="text-sm font-bold text-slate-800">{popup.type === 'success' ? 'Success' : 'Error'}</h4>
            <p className="text-xs text-slate-500">{popup.message}</p>
          </div>
        </div>
      )}

      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#084e8d] tracking-tight">Employee Document Vault</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 sm:mt-2">Secure repository for staff verification and HR records.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden w-full max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-[#084e8d]/5 to-white px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-[#084e8d]/10 p-2 rounded-lg mr-3 flex-shrink-0">
              <Shield className="text-[#084e8d]" size={18} />
            </div>
            <h3 className="text-sm sm:text-[15px] font-bold text-slate-800 uppercase tracking-wider">HR Records Workspace</h3>
          </div>
          
          {/* Access Badge */}
          <div className={`px-3 py-1 rounded-full flex items-center gap-1.5 text-[10px] sm:text-xs font-bold border ${canUploadDelete ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : canSearch ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
            <Lock size={12} />
            {canUploadDelete ? 'FULL ACCESS' : canSearch ? 'VIEWING ACCESS' : 'PERSONAL VAULT'}
          </div>
        </div>
        
        <div className="p-4 sm:p-8">
          
          {/* Search Bar - Hidden for Regular Employees */}
          {canSearch && (
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 w-full bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200">
              <div className="flex-1 relative w-full">
                <Search className="absolute left-3 sm:left-4 top-3 sm:top-3.5 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search Exact Employee ID (e.g. 101/03/RAPTOR/26)" 
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                  className="pl-10 sm:pl-12 block w-full px-4 py-2.5 sm:py-3 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#084e8d]/20 focus:border-[#084e8d] transition-all outline-none shadow-sm uppercase"
                />
              </div>
              <button 
                onClick={handleSearchClick}
                disabled={loading}
                className="w-full sm:w-auto bg-slate-900 text-white px-6 sm:px-10 py-2.5 sm:py-3 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-md hover:shadow-lg flex-shrink-0 flex items-center justify-center disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                {loading ? 'Searching...' : 'Fetch Employee'}
              </button>
            </div>
          )}

          {activeEmployee ? (
            <div className="w-full space-y-6 animate-in fade-in duration-300">
              
              {/* Employee Info Header */}
              <div className="flex items-center p-3 sm:p-4 bg-[#084e8d]/5 border border-[#084e8d]/20 rounded-2xl">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-[#084e8d]/10 text-[#084e8d] rounded-full flex items-center justify-center mr-3 sm:mr-4 font-bold text-base sm:text-lg flex-shrink-0">
                  {activeEmployee.name.substring(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h4 className="text-base sm:text-lg font-bold text-slate-800 truncate">
                    {activeEmployee.name} <span className="text-[#084e8d] ml-1">({activeEmployee.id})</span>
                  </h4>
                  <p className="text-[11px] sm:text-xs font-medium text-slate-500 mt-0.5 truncate">{activeEmployee.role}</p>
                </div>
              </div>

              {/* Document Vault Grid */}
              <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-4 sm:p-6">
                
                {/* Header & Helper Note Container */}
                <div className="mb-5 sm:mb-6">
                  <div className="flex items-center mb-3">
                    <div className="bg-[#084e8d]/10 p-2 rounded-lg mr-3 flex-shrink-0">
                      <FolderOpen className="text-[#084e8d]" size={18} />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm sm:text-base">Verification Documents</h4>
                  </div>
                  
                  {/* 🔥 NEW: Helpful Note for Uploads */}
                  {canUploadDelete && (
                    <div className="flex items-start gap-2 bg-blue-50/80 border border-blue-100 rounded-lg p-3 w-full">
                      <Info className="text-blue-500 flex-shrink-0 mt-0.5" size={16} />
                      <p className="text-[11px] sm:text-xs text-blue-800 leading-relaxed font-medium">
                        <span className="font-bold">Upload Tip:</span> Upload a <span className="font-bold border-b border-blue-300">single image (JPG/PNG)</span> if only one page is required (e.g. Photo, PAN). If the document has multiple pages (e.g. ID Card Front & Back), please merge them and upload as a <span className="font-bold border-b border-blue-300">single PDF file</span>.
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {documentSlots.map((slot) => {
                    const docData = activeEmployee.documents?.[slot.key];
                    const isUploaded = !!docData;
                    const isProcessing = actionLoading[slot.key];
                    
                    return (
                      <div key={slot.key} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow transition-shadow">
                        <div className="flex items-start justify-between mb-4 gap-2">
                          <div className="flex items-start sm:items-center gap-2.5">
                            <FileText size={18} className={`${isUploaded ? 'text-emerald-500' : 'text-slate-400'} flex-shrink-0 mt-0.5 sm:mt-0`} />
                            <span className="font-semibold text-xs sm:text-sm text-slate-700">{slot.label}</span>
                          </div>
                          {isUploaded && <Check size={18} className="text-emerald-500 flex-shrink-0" strokeWidth={3} />}
                        </div>
                        
                        {isProcessing ? (
                          <div className="flex flex-col items-center justify-center py-3 border border-dashed border-slate-200 rounded-lg mt-auto bg-slate-50">
                            <Loader2 className="animate-spin text-[#084e8d] mb-2" size={20} />
                            <span className="text-xs text-slate-500 font-medium">Processing...</span>
                          </div>
                        ) : isUploaded ? (
                          <div className="mt-1 bg-emerald-50/80 rounded-lg p-2.5 border border-emerald-100">
                            <p className="text-[11px] sm:text-xs text-slate-800 font-bold truncate mb-1" title={docData.name}>{docData.name}</p>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{docData.date}</span>
                              <div className="flex gap-1.5">
                                <a 
                                  href={docData.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-[#084e8d]/70 hover:text-[#084e8d] bg-white p-1.5 rounded-md shadow-sm border border-slate-100 transition-colors flex-shrink-0"
                                  title="View File"
                                >
                                  <Eye size={14} />
                                </a>
                                
                                {/* Only Super Admin can see Delete Button */}
                                {canUploadDelete && (
                                  <button 
                                    onClick={() => handleDeleteFile(slot.key, docData._id)}
                                    className="text-[#e9272e]/70 hover:text-[#e9272e] bg-white p-1.5 rounded-md shadow-sm border border-slate-100 transition-colors flex-shrink-0"
                                    title="Remove File"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}  
                              </div>
                            </div>
                          </div>
                        ) : (
                          canUploadDelete ? (
                            <label className="cursor-pointer bg-white hover:bg-[#084e8d]/5 hover:border-[#084e8d]/30 hover:text-[#084e8d] border border-dashed border-slate-300 rounded-lg flex justify-center py-2.5 sm:py-3 transition-colors group mt-auto">
                              <span className="text-[11px] sm:text-xs font-bold text-slate-500 group-hover:text-[#084e8d] flex items-center gap-2">
                                <UploadCloud size={16} /> Click to Upload
                              </span>
                              <input 
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="hidden" 
                                onChange={(e) => handleFileUpload(slot.key, e.target.files[0])} 
                              />
                            </label>
                          ) : (
                            <div className="flex justify-center items-center py-2.5 sm:py-3 mt-auto bg-slate-50 rounded-lg border border-slate-200">
                              <span className="text-[11px] sm:text-xs font-medium text-slate-400 flex items-center gap-2">
                                <Shield size={14} /> Document Not Uploaded
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 sm:py-20 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-300">
              {loading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="animate-spin text-[#084e8d] h-10 w-10 mb-4" />
                  <p className="text-sm text-slate-500">Loading secure records...</p>
                </div>
              ) : (
                <>
                  <div className="bg-white h-14 w-14 sm:h-16 sm:w-16 rounded-full flex items-center justify-center mx-auto shadow-sm mb-4">
                    <UserCheck className="h-7 w-7 sm:h-8 sm:w-8 text-[#084e8d]/70" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-800">No Employee Selected</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-sm mx-auto">
                    {canSearch 
                      ? 'Enter an exact Employee ID (e.g. 101/03/RAPTOR/26) to manage their records.'
                      : 'Fetching your secure records...'}
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}