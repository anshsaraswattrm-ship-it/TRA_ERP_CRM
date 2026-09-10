import { useState, useEffect, useRef } from 'react';
import { Camera, QrCode, CheckCircle2, Clock, Search, CalendarDays, User, ShieldCheck, LogOut, Loader2, X, Download } from 'lucide-react';
import * as faceapi from 'face-api.js';
import { Scanner } from '@yudiel/react-qr-scanner';

// ✅ 100% BULLETPROOF DATE FORMATTER
const formatSafeDate = (dateObj) => {
  const day = String(dateObj.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  return `${day} ${month} ${year}`;
};

// ✅ Helper function for advanced status badge colors
const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Present': return 'bg-green-100 text-green-800';
    case 'Late': return 'bg-amber-100 text-amber-800';
    case 'Paid Short Leave': return 'bg-indigo-100 text-indigo-800';
    case 'Paid Half Day': return 'bg-purple-100 text-purple-800';
    case 'Unpaid Half Day': return 'bg-orange-100 text-orange-800';
    case 'Absent': return 'bg-[#e9272e]/10 text-[#e9272e]';
    default: return 'bg-slate-100 text-slate-500';
  }
};

export default function Attendance() {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const userRole = userInfo?.role || 'BDE LEVEL1';
  
  const isSuperAdmin = userRole === 'Super Admin';
  const isFounder = userRole === 'Founder and Director';
  const isReceptionist = userRole === 'Receptionist';

  const [viewRole, setViewRole] = useState((isSuperAdmin || isFounder || isReceptionist) ? 'admin' : 'employee');

  const [myLogs, setMyLogs] = useState([]);
  const [allEmployeesLogs, setAllEmployeesLogs] = useState([]);
  const [apiLoading, setApiLoading] = useState(false);

  const [authStep, setAuthStep] = useState(0); 
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [clockOutStep, setClockOutStep] = useState(0);

  const [isScanningQRIn, setIsScanningQRIn] = useState(false);
  const [isScanningQROut, setIsScanningQROut] = useState(false);

  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [faceStatusMsg, setFaceStatusMsg] = useState('');
  const videoRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  const [adminSearch, setAdminSearch] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    const dates = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(formatSafeDate(d));
    }
    setAvailableDates(dates);
    setSelectedDate(dates[0]);

    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error("Failed to load face-api models", err);
      }
    };
    loadModels();
  }, []);

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${userInfo?.token}`
  });

  const fetchMyLogs = async () => {
    try {
      const res = await fetch('https://tra-erp-crm.onrender.com/api/attendance/my-logs', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setMyLogs(data);
        
        const todayDate = formatSafeDate(new Date());
        const todayLog = data.find(log => log.date === todayDate);
        
        if (todayLog && todayLog.clockInTime !== '--:--' && todayLog.clockOutTime === '--:--') {
          setIsCheckedIn(true);
        } else {
          setIsCheckedIn(false);
        }
      }
    } catch (error) {
      console.error("Failed to fetch my logs", error);
    }
  };

  const fetchAdminLogs = async (date) => {
    try {
      const res = await fetch(`https://tra-erp-crm.onrender.com/api/attendance/admin-logs?date=${date}`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setAllEmployeesLogs(data);
      } else {
        console.error("Failed to fetch admin logs. Check backend permissions.");
      }
    } catch (error) {
      console.error("Failed to fetch admin logs", error);
    }
  };

  useEffect(() => {
    if (userInfo?.token) {
      fetchMyLogs();
    }
  }, [userInfo?.token]);

  useEffect(() => {
    if (viewRole === 'admin' && selectedDate && userInfo?.token) {
      fetchAdminLogs(selectedDate);
    }
  }, [viewRole, selectedDate, userInfo?.token]);

  const filteredAdminLogs = allEmployeesLogs.filter(log => 
    log.employee?.name?.toLowerCase().includes(adminSearch.toLowerCase()) || 
    log.employeeId?.toLowerCase().includes(adminSearch.toLowerCase())
  );

  const filteredMyLogs = myLogs.filter(log => availableDates.includes(log.date));

  const handleDownloadMonthlyReport = async () => {
    const employeeIdInput = prompt("Enter Employee ID for monthly report (e.g., 101/SEP/RAPTOR/26):");
    if (!employeeIdInput) return;

    const monthInput = prompt("Enter Month short code (e.g., Sept, Aug, Oct):", "Sept");
    if (!monthInput) return;

    const yearInput = prompt("Enter Year:", "2026");
    if (!yearInput) return;

    try {
      setApiLoading(true);
      const res = await fetch(`https://tra-erp-crm.onrender.com/api/attendance/monthly-report/${employeeIdInput.trim()}?month=${monthInput.trim()}&year=${yearInput.trim()}`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Failed to generate monthly report');
        setApiLoading(false);
        return;
      }

      let csvContent = "data:text/csv;charset=utf-8,Date,Employee ID,Name,Role,Clock In,Clock Out,Status\n";
      
      data.report.forEach(row => {
        csvContent += `"${row.date}","${data.employee.employeeId}","${data.employee.name}","${data.employee.role || '-'}","${row.clockInTime}","${row.clockOutTime}","${row.status}"\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${data.employee.name}_${monthInput}_${yearInput}_Attendance.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error("Download error:", err);
      alert("Network error while downloading report.");
    } finally {
      setApiLoading(false);
    }
  };

  const startCamera = () => {
    setShowCameraModal(true);
    setCameraLoading(true);
    setFaceStatusMsg('Initializing camera...');
    
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraLoading(false);
        setFaceStatusMsg('Camera ready. Position your face in front of the camera.');
      })
      .catch((err) => {
        console.error("Camera error:", err);
        setCameraLoading(false);
        setFaceStatusMsg('Camera access denied or unavailable.');
      });
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowCameraModal(false);
  };

  const verifyLiveFace = async () => {
    if (!modelsLoaded) {
      alert("AI models are still loading. Please wait a moment.");
      return;
    }

    setAuthStep(1);
    setFaceStatusMsg('Scanning and verifying face...');

    try {
      const profileRes = await fetch('https://tra-erp-crm.onrender.com/api/auth/profile', { headers: getAuthHeaders() });
      const profileData = await profileRes.json();
      
      if (!profileData.faceDescriptor || profileData.faceDescriptor.length === 0) {
        alert("No face enrolled for your account! Please contact admin or enroll face first.");
        setAuthStep(0);
        stopCamera();
        return;
      }

      const registeredDescriptor = new Float32Array(profileData.faceDescriptor);

      const detection = await faceapi.detectSingleFace(
        videoRef.current, 
        new faceapi.SsdMobilenetv1Options()
      ).withFaceLandmarks().withFaceDescriptor();

      if (!detection) {
        alert("No face detected clearly. Please try again with good lighting.");
        setAuthStep(0);
        setFaceStatusMsg('Face not detected.');
        return;
      }

      const distance = faceapi.euclideanDistance(detection.descriptor, registeredDescriptor);

      if (distance < 0.6) {
        setFaceStatusMsg('Face Verified Successfully!');
        setTimeout(() => {
          stopCamera();
          setAuthStep(2); 
        }, 1000);
      } else {
        alert(`Face mismatch! Distance: ${distance.toFixed(2)}. Please try again.`);
        setAuthStep(0);
        setFaceStatusMsg('Verification failed. Face does not match.');
      }
    } catch (err) {
      console.error("Face verification error:", err);
      alert("Error during face verification.");
      setAuthStep(0);
    }
  };

  const handleQRScanInActual = async (scannedToken) => {
    setIsScanningQRIn(false);
    setAuthStep(3);
    try {
      const actualToken = Array.isArray(scannedToken) ? scannedToken[0]?.rawValue : scannedToken;
      
      const res = await fetch('https://tra-erp-crm.onrender.com/api/attendance/verify-qr', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ qrToken: actualToken })
      });
      const data = await res.json();

      if (res.ok) {
        setAuthStep(4);
      } else {
        alert(data.message || 'QR Verification failed');
        setAuthStep(2); 
      }
    } catch (err) {
      console.error("QR scan error:", err);
      alert("Network error during QR verification.");
      setAuthStep(2);
    }
  };

  const handleQRScanOutActual = async (scannedToken) => {
    setIsScanningQROut(false);
    setClockOutStep(1); 
    try {
      const actualToken = Array.isArray(scannedToken) ? scannedToken[0]?.rawValue : scannedToken;

      const res = await fetch('https://tra-erp-crm.onrender.com/api/attendance/verify-qr', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ qrToken: actualToken })
      });
      const data = await res.json();

      if (res.ok) {
        setClockOutStep(2);
      } else {
        alert(data.message || 'QR Verification failed');
        setClockOutStep(0); 
      }
    } catch (err) {
      console.error("QR scan error:", err);
      alert("Network error during QR verification.");
      setClockOutStep(0);
    }
  };

  const handleClockIn = async () => {
    setApiLoading(true);
    try {
      const res = await fetch('https://tra-erp-crm.onrender.com/api/attendance/clock-in', {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      
      if (res.ok) {
        setAuthStep(5);
        setIsCheckedIn(true);
        setClockOutStep(0);
        fetchMyLogs();
      } else {
        alert(data.message || 'Action failed');
      }
    } catch (error) {
      alert("Server is not responding");
    } finally {
      setApiLoading(false);
    }
  };

  const handleClockOut = async () => {
    setApiLoading(true);
    try {
      const res = await fetch('https://tra-erp-crm.onrender.com/api/attendance/clock-out', {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      
      if (res.ok) {
        setAuthStep(0);
        setClockOutStep(0);
        setIsCheckedIn(false);
        fetchMyLogs();
      } else {
        alert(data.message || 'Action failed');
      }
    } catch (error) {
      alert("Server is not responding");
    } finally {
      setApiLoading(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-12 pt-4 relative overflow-x-hidden">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#084e8d] tracking-tight">Attendance System</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Biometric Face Verification & Dynamic QR Access</p>
        </div>
        
        {isSuperAdmin && (
          <div className="flex w-full sm:w-auto bg-slate-100 p-1.5 rounded-xl border border-slate-200 shadow-inner">
            <button 
              onClick={() => setViewRole('employee')}
              className={`flex-1 sm:flex-none px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-colors ${viewRole === 'employee' ? 'bg-white text-[#084e8d] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Employee View
            </button>
            <button 
              onClick={() => setViewRole('admin')}
              className={`flex-1 sm:flex-none px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-colors ${viewRole === 'admin' ? 'bg-white text-[#084e8d] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Company Logs View
            </button>
          </div>
        )}
      </div>

      {/* EMPLOYEE VIEW */}
      {viewRole === 'employee' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          <div className="lg:col-span-4">
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center mb-6 pb-4 border-b border-slate-100">
                <div className="bg-[#084e8d]/10 p-2 rounded-lg mr-3 flex-shrink-0">
                  <ShieldCheck className="text-[#084e8d]" size={20} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-800">Daily Access Portal</h3>
              </div>

              {isCheckedIn ? (
                <div className="text-center py-4">
                  <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-green-50 rounded-full flex items-center justify-center mb-4 border border-green-100">
                    <CheckCircle2 className="text-green-500 sm:w-10 sm:h-10 w-8 h-8" size={36} />
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold text-slate-800 mb-1">You are Clocked In</h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 mb-8 px-2 sm:px-4">Attendance marked successfully. Complete verification to clock out securely.</p>

                  <div className="max-w-xs mx-auto text-left">
                    <div className={`p-4 sm:p-5 rounded-xl border-2 transition-all mb-6 ${clockOutStep >= 2 ? 'border-green-200 bg-green-50' : clockOutStep === 1 ? 'border-[#e9272e]/30 bg-[#e9272e]/5' : 'border-slate-200 bg-slate-50'}`}>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-slate-800 text-xs sm:text-sm">QR Location Verification</h4>
                        {clockOutStep >= 2 && <CheckCircle2 className="text-green-500 flex-shrink-0" size={18} />}
                      </div>

                      {clockOutStep === 0 && !isScanningQROut && (
                        <button onClick={() => setIsScanningQROut(true)} className="w-full py-2.5 bg-white border border-slate-300 text-slate-700 text-xs sm:text-sm font-bold rounded-lg hover:bg-slate-100 flex justify-center items-center shadow-sm">
                          <QrCode className="mr-2 flex-shrink-0" size={16} /> Open Camera to Scan
                        </button>
                      )}

                      {clockOutStep === 0 && isScanningQROut && (
                        <div className="w-full rounded-lg overflow-hidden border-2 border-[#084e8d] mt-2 shadow-inner">
                          <Scanner 
                            onScan={(text) => handleQRScanOutActual(text)} 
                            onError={(error) => console.log(error?.message)} 
                          />
                          <button onClick={() => setIsScanningQROut(false)} className="w-full py-2 bg-red-500 hover:bg-red-600 transition-colors text-white text-[11px] sm:text-xs font-bold">Cancel Scanner</button>
                        </div>
                      )}

                      {clockOutStep === 1 && (
                        <div className="text-center py-2 text-[#e9272e] font-bold text-xs sm:text-sm flex justify-center items-center">
                          <Loader2 className="animate-spin mr-2" size={16} /> Verifying Code...
                        </div>
                      )}

                      {clockOutStep >= 2 && <p className="text-[11px] sm:text-xs text-green-600 font-semibold">Exit Location Verified.</p>}
                    </div>

                    <button 
                      disabled={clockOutStep !== 2 || apiLoading}
                      onClick={handleClockOut}
                      className={`w-full flex items-center justify-center py-3 sm:py-3.5 px-4 font-bold rounded-xl shadow-lg transition-all transform text-sm sm:text-base ${clockOutStep === 2 ? 'bg-[#e9272e] hover:bg-[#c91d24] text-white shadow-[#e9272e]/20 hover:-translate-y-0.5' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                    >
                      {apiLoading ? <Loader2 className="animate-spin mr-2 flex-shrink-0" size={18} /> : <LogOut className="mr-2 flex-shrink-0" size={18} />}
                      {apiLoading ? 'Clocking out...' : 'Confirm Clock-Out'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  <div className={`p-4 sm:p-5 rounded-xl border-2 transition-all ${authStep >= 2 ? 'border-green-200 bg-green-50' : authStep === 1 ? 'border-[#084e8d]/40 bg-[#084e8d]/5' : 'border-slate-200 bg-slate-50'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-slate-800 flex items-center text-xs sm:text-sm">
                        <span className="bg-slate-800 text-white w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs mr-2 sm:mr-2.5 flex-shrink-0">1</span> 
                        Face Verification
                      </h4>
                      {authStep >= 2 && <CheckCircle2 className="text-green-500 flex-shrink-0" size={18} />}
                    </div>
                    {authStep === 0 && (
                      <button onClick={startCamera} className="w-full py-2 sm:py-2.5 bg-white border border-slate-300 text-slate-700 text-xs sm:text-sm font-bold rounded-lg hover:bg-slate-100 flex justify-center items-center shadow-sm">
                        <Camera className="mr-2 flex-shrink-0" size={16} /> Start Camera
                      </button>
                    )}
                    {authStep === 1 && (
                      <div className="text-center py-2 text-[#084e8d] font-bold flex justify-center items-center text-xs sm:text-sm">
                        <Loader2 className="animate-spin mr-2" size={16} /> Scanning Face...
                      </div>
                    )}
                    {authStep >= 2 && <p className="text-[11px] sm:text-xs text-green-600 font-semibold">Face Matched Successfully.</p>}
                  </div>

                  {/* ✅ UPDATED STEP 2 UI (Dynamic Highlighting) */}
                  <div className={`p-4 sm:p-5 rounded-xl border-2 transition-all ${
                    authStep >= 4 ? 'border-green-200 bg-green-50' : 
                    authStep === 3 ? 'border-[#084e8d]/40 bg-[#084e8d]/5' : 
                    authStep === 2 ? 'border-slate-300 bg-white shadow-sm opacity-100' : 
                    'border-slate-200 bg-slate-50 opacity-50'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-slate-800 flex items-center text-xs sm:text-sm">
                        <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs mr-2 sm:mr-2.5 flex-shrink-0 ${
                          authStep >= 2 ? 'bg-slate-800 text-white' : 'bg-slate-300 text-slate-500'
                        }`}>2</span> 
                        Reception TV QR Scan
                      </h4>
                      {authStep >= 4 && <CheckCircle2 className="text-green-500 flex-shrink-0" size={18} />}
                    </div>

                    {authStep === 2 && !isScanningQRIn && (
                      <button onClick={() => setIsScanningQRIn(true)} className="w-full py-2 sm:py-2.5 bg-white border border-slate-300 text-slate-700 text-xs sm:text-sm font-bold rounded-lg hover:bg-slate-100 flex justify-center items-center shadow-sm">
                        <QrCode className="mr-2 flex-shrink-0" size={16} /> Open Camera to Scan
                      </button>
                    )}

                    {authStep === 2 && isScanningQRIn && (
                      <div className="w-full rounded-lg overflow-hidden border-2 border-[#084e8d] mt-2 shadow-inner">
                        <Scanner 
                          onScan={(text) => handleQRScanInActual(text)} 
                          onError={(error) => console.log(error?.message)} 
                        />
                        <button onClick={() => setIsScanningQRIn(false)} className="w-full py-2 bg-red-500 hover:bg-red-600 transition-colors text-white text-[11px] sm:text-xs font-bold">Cancel Scanner</button>
                      </div>
                    )}

                    {authStep === 3 && (
                      <div className="text-center py-2 text-[#084e8d] font-bold flex justify-center items-center text-xs sm:text-sm">
                        <Loader2 className="animate-spin mr-2" size={16} /> Verifying Dynamic QR...
                      </div>
                    )}
                    {authStep >= 4 && <p className="text-[11px] sm:text-xs text-green-600 font-semibold">Office Wi-Fi & QR Verified.</p>}
                  </div>

                  <div className="pt-2">
                    <button 
                      disabled={authStep !== 4 || apiLoading}
                      onClick={handleClockIn}
                      className={`w-full py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all transform flex justify-center items-center ${authStep === 4 ? 'bg-[#084e8d] text-white hover:bg-[#063a6b] shadow-lg shadow-[#084e8d]/20 hover:-translate-y-0.5' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                    >
                      {apiLoading ? <Loader2 className="animate-spin mr-2 flex-shrink-0" size={18} /> : <Clock className="mr-2 flex-shrink-0" size={18} />}
                      {apiLoading ? 'Clocking in...' : 'Mark Attendance'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 h-full">
              <div className="flex items-center mb-6 pb-4 border-b border-slate-100">
                <div className="bg-[#084e8d]/10 p-2 rounded-lg mr-3 flex-shrink-0">
                  <User className="text-[#084e8d]" size={20} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-800">My Attendance Log</h3>
              </div>
              <div className="w-full overflow-x-auto rounded-xl border border-slate-200" style={{ WebkitOverflowScrolling: 'touch' }}>
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-[#084e8d] text-white">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-[11px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap">Date</th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-[11px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap">Clock In</th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-[11px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap">Clock Out</th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-right text-[11px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {filteredMyLogs.length > 0 ? (
                      filteredMyLogs.map((log) => (
                        <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-bold text-slate-800">{log.date}</td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-slate-600">{log.clockInTime}</td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-slate-600">{log.clockOutTime}</td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                            <span className={`px-3 sm:px-4 py-1 sm:py-1.5 inline-flex text-[10px] sm:text-xs leading-5 font-bold rounded-full ${getStatusBadgeClass(log.status)}`}>
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-xs sm:text-sm text-slate-500">No attendance records found for the last 5 days.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN / RECEPTIONIST VIEW */}
      {viewRole === 'admin' && (isSuperAdmin || isFounder || isReceptionist) && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 relative w-full">
          <div className="sticky top-0 z-30 bg-slate-50 border-b border-slate-200 p-4 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-t-2xl shadow-sm">
            <h3 className="text-lg sm:text-xl font-bold text-[#084e8d] flex items-center">
              <CalendarDays className="mr-2 flex-shrink-0" size={24} /> Company Attendance Log
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full md:w-auto items-center">
              <button 
                onClick={handleDownloadMonthlyReport}
                disabled={apiLoading}
                className="px-4 py-2 bg-[#084e8d] hover:bg-[#063a6b] text-white font-bold rounded-lg text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-colors whitespace-nowrap w-full sm:w-auto justify-center"
              >
                <Download size={16} /> {apiLoading ? 'Generating...' : 'Download Report'}
              </button>

              <select 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 sm:px-4 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#084e8d]/50 w-full sm:w-auto"
              >
                {availableDates.map(date => (
                  <option key={date} value={date}>{date === availableDates[0] ? 'Today' : date}</option>
                ))}
              </select>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-2 sm:top-2.5 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search Employee Name/ID..." 
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#084e8d]/50 w-full sm:w-64 bg-white"
                />
              </div>
            </div>
          </div>

          <div className="w-full overflow-x-auto rounded-b-2xl custom-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-[#084e8d] text-white">
                <tr>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-[11px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap">Employee Info</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-[11px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap">Designation</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-[11px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap">Clock In</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-[11px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap">Clock Out</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-right text-[11px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredAdminLogs.length > 0 ? (
                  filteredAdminLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-xs sm:text-sm">{log.employee?.name || 'Unknown'}</span>
                          <span className="text-[10px] sm:text-xs font-medium text-slate-500 mt-0.5">{log.employeeId}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-slate-600">{log.employee?.role || '-'}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-bold text-slate-700">{log.clockInTime}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-bold text-slate-700">{log.clockOutTime}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                        <span className={`px-3 sm:px-4 py-1 sm:py-1.5 inline-flex text-[10px] sm:text-xs leading-5 font-bold rounded-full ${getStatusBadgeClass(log.status)}`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-xs sm:text-sm text-slate-500 font-medium">
                      No records found for the selected date or search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Cameras */}
      {showCameraModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 sm:p-6 relative border border-slate-200">
            <button 
              onClick={stopCamera} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 p-2 rounded-full"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg sm:text-xl font-bold text-[#084e8d] mb-2 flex items-center pr-8">
              <Camera className="mr-2 flex-shrink-0 sm:w-5 sm:h-5 w-4 h-4" size={20} /> Live Face Verification
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 mb-4">{faceStatusMsg}</p>
            <div className="relative w-full h-64 sm:h-72 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center shadow-inner mb-6">
              {cameraLoading && (
                <div className="absolute inset-0 flex items-center justify-center text-white bg-black/50 text-sm">
                  <Loader2 className="animate-spin mr-2" size={20} /> Starting Camera...
                </div>
              )}
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline 
                className="w-full h-full object-cover transform -scale-x-100"
              />
            </div>
            <button 
              onClick={verifyLiveFace}
              disabled={cameraLoading || !modelsLoaded}
              className="w-full py-3 bg-[#084e8d] hover:bg-[#063a6b] text-white font-bold rounded-xl shadow-lg shadow-[#084e8d]/20 transition-all flex justify-center items-center cursor-pointer text-sm sm:text-base"
            >
              <ShieldCheck className="mr-2 flex-shrink-0" size={18} /> Verify & Match Face
            </button>
          </div>
        </div>
      )}
    </div>
  );
}