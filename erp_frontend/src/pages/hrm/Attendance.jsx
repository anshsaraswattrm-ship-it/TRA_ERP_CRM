import { useState, useEffect, useRef } from 'react';
import { Camera, QrCode, CheckCircle2, Clock, Search, CalendarDays, User, ShieldCheck, LogOut, Loader2, X } from 'lucide-react';
import * as faceapi from 'face-api.js';
import { Scanner } from '@yudiel/react-qr-scanner'; // <-- REAL SCANNER IMPORTED

export default function Attendance() {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const userRole = userInfo?.role || 'BDE LEVEL1';
  
  // Specific Role Checks
  const isSuperAdmin = userRole === 'Super Admin';
  const isFounder = userRole === 'Founder and Director';
  const isEmployee = !isSuperAdmin && !isFounder;

  // Set default view: Admins/Founders see 'admin', Employees see 'employee'
  const [viewRole, setViewRole] = useState((isSuperAdmin || isFounder) ? 'admin' : 'employee');

  // --- API & DATA STATES ---
  const [myLogs, setMyLogs] = useState([]);
  const [allEmployeesLogs, setAllEmployeesLogs] = useState([]);
  const [apiLoading, setApiLoading] = useState(false);

  // --- EMPLOYEE STATE ---
  const [authStep, setAuthStep] = useState(0); 
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [clockOutStep, setClockOutStep] = useState(0);

  // --- QR SCANNER STATES (NEW) ---
  const [isScanningQRIn, setIsScanningQRIn] = useState(false);
  const [isScanningQROut, setIsScanningQROut] = useState(false);

  // --- CAMERA & FACE API STATES ---
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [faceStatusMsg, setFaceStatusMsg] = useState('');
  const videoRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // --- ADMIN STATE ---
  const [adminSearch, setAdminSearch] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');

  // Setup Dates on Load & Load Face API Models
  useEffect(() => {
    const dates = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));
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
        
        const todayDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
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
      }
    } catch (error) {
      console.error("Failed to fetch admin logs", error);
    }
  };

  useEffect(() => {
    if (userInfo?.token && (viewRole === 'employee' || isSuperAdmin)) {
      fetchMyLogs();
    }
  }, []);

  useEffect(() => {
    if (viewRole === 'admin' && selectedDate && userInfo?.token) {
      fetchAdminLogs(selectedDate);
    }
  }, [viewRole, selectedDate]);

  const filteredAdminLogs = allEmployeesLogs.filter(log => 
    log.employee?.name?.toLowerCase().includes(adminSearch.toLowerCase()) || 
    log.employeeId?.toLowerCase().includes(adminSearch.toLowerCase())
  );

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
      console.log("Face Match Euclidean Distance:", distance);

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

  // --------------------------------------------------------
  // REAL CAMERA QR VERIFICATION FOR CLOCK IN
  // --------------------------------------------------------
  const handleQRScanInActual = async (scannedToken) => {
    setIsScanningQRIn(false);
    setAuthStep(3); // Show spinner
    try {
      const res = await fetch('https://tra-erp-crm.onrender.com/api/attendance/verify-qr', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ qrToken: scannedToken })
      });
      const data = await res.json();

      if (res.ok) {
        setAuthStep(4); // Success, move to Mark Attendance
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

  // --------------------------------------------------------
  // REAL CAMERA QR VERIFICATION FOR CLOCK OUT
  // --------------------------------------------------------
  const handleQRScanOutActual = async (scannedToken) => {
    setIsScanningQROut(false);
    setClockOutStep(1); // Show spinner
    try {
      const res = await fetch('https://tra-erp-crm.onrender.com/api/attendance/verify-qr', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ qrToken: scannedToken })
      });
      const data = await res.json();

      if (res.ok) {
        setClockOutStep(2); // Success, enable Clock-Out button
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
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-12 pt-4 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-[#084e8d] tracking-tight">Attendance System</h2>
          <p className="text-sm text-slate-500 mt-1">Biometric Face Verification & Dynamic QR Access</p>
        </div>
        {isSuperAdmin && (
          <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 shadow-inner">
            <button 
              onClick={() => setViewRole('employee')}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-colors ${viewRole === 'employee' ? 'bg-white text-[#084e8d] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Employee View
            </button>
            <button 
              onClick={() => setViewRole('admin')}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-colors ${viewRole === 'admin' ? 'bg-white text-[#084e8d] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Admin View
            </button>
          </div>
        )}
      </div>

      {viewRole === 'employee' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center mb-6 pb-4 border-b border-slate-100">
                <div className="bg-[#084e8d]/10 p-2 rounded-lg mr-3">
                  <ShieldCheck className="text-[#084e8d]" size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Daily Access Portal</h3>
              </div>

              {isCheckedIn ? (
                <div className="text-center py-4">
                  <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4 border border-green-100">
                    <CheckCircle2 className="text-green-500" size={40} />
                  </div>
                  <h4 className="text-xl font-bold text-slate-800 mb-1">You are Clocked In</h4>
                  <p className="text-xs text-slate-500 mb-8 px-4">Attendance marked successfully. Complete verification to clock out securely.</p>

                  <div className="max-w-xs mx-auto text-left">
                    <div className={`p-5 rounded-xl border-2 transition-all mb-6 ${clockOutStep >= 2 ? 'border-green-200 bg-green-50' : clockOutStep === 1 ? 'border-[#e9272e]/30 bg-[#e9272e]/5' : 'border-slate-200 bg-slate-50'}`}>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-slate-800 text-sm">QR Location Verification</h4>
                        {clockOutStep >= 2 && <CheckCircle2 className="text-green-500" size={18} />}
                      </div>

                      {/* --- REAL QR SCANNER UI FOR CLOCK OUT --- */}
                      {clockOutStep === 0 && !isScanningQROut && (
                        <button onClick={() => setIsScanningQROut(true)} className="w-full py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-100 flex justify-center items-center shadow-sm">
                          <QrCode className="mr-2" size={16} /> Open Camera to Scan Out
                        </button>
                      )}

                      {clockOutStep === 0 && isScanningQROut && (
                        <div className="w-full rounded-lg overflow-hidden border-2 border-[#084e8d] mt-2 shadow-inner">
                          <Scanner 
                            onResult={(text) => handleQRScanOutActual(text)} 
                            onError={(error) => console.log(error?.message)} 
                          />
                          <button onClick={() => setIsScanningQROut(false)} className="w-full py-2 bg-red-500 hover:bg-red-600 transition-colors text-white text-xs font-bold">Cancel Scanner</button>
                        </div>
                      )}

                      {clockOutStep === 1 && (
                        <div className="text-center py-2 text-[#e9272e] font-bold text-sm flex justify-center items-center">
                          <Loader2 className="animate-spin mr-2" size={16} /> Verifying Code...
                        </div>
                      )}

                      {clockOutStep >= 2 && <p className="text-xs text-green-600 font-semibold">Exit Location Verified.</p>}
                    </div>

                    <button 
                      disabled={clockOutStep !== 2 || apiLoading}
                      onClick={handleClockOut}
                      className={`w-full flex items-center justify-center py-3.5 px-4 font-bold rounded-xl shadow-lg transition-all transform ${clockOutStep === 2 ? 'bg-[#e9272e] hover:bg-[#c91d24] text-white shadow-[#e9272e]/20 hover:-translate-y-0.5' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                    >
                      {apiLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : <LogOut className="mr-2" size={20} />}
                      {apiLoading ? 'Clocking out...' : 'Confirm Clock-Out'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className={`p-5 rounded-xl border-2 transition-all ${authStep >= 2 ? 'border-green-200 bg-green-50' : authStep === 1 ? 'border-[#084e8d]/40 bg-[#084e8d]/5' : 'border-slate-200 bg-slate-50'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-slate-800 flex items-center text-sm">
                        <span className="bg-slate-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2.5">1</span> 
                        Face Verification
                      </h4>
                      {authStep >= 2 && <CheckCircle2 className="text-green-500" size={20} />}
                    </div>
                    {authStep === 0 && (
                      <button onClick={startCamera} className="w-full py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-100 flex justify-center items-center shadow-sm">
                        <Camera className="mr-2" size={18} /> Start Camera
                      </button>
                    )}
                    {authStep === 1 && (
                      <div className="text-center py-2 text-[#084e8d] font-bold flex justify-center items-center text-sm">
                        <Loader2 className="animate-spin mr-2" size={18} /> Scanning Face...
                      </div>
                    )}
                    {authStep >= 2 && <p className="text-xs text-green-600 font-semibold">Face Matched Successfully.</p>}
                  </div>

                  <div className={`p-5 rounded-xl border-2 transition-all ${authStep >= 4 ? 'border-green-200 bg-green-50' : authStep === 3 ? 'border-[#084e8d]/40 bg-[#084e8d]/5' : 'border-slate-200 bg-slate-50 opacity-50'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-slate-800 flex items-center text-sm">
                        <span className="bg-slate-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2.5">2</span> 
                        Reception TV QR Scan
                      </h4>
                      {authStep >= 4 && <CheckCircle2 className="text-green-500" size={20} />}
                    </div>

                    {/* --- REAL QR SCANNER UI FOR CLOCK IN --- */}
                    {authStep === 2 && !isScanningQRIn && (
                      <button onClick={() => setIsScanningQRIn(true)} className="w-full py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-100 flex justify-center items-center shadow-sm">
                        <QrCode className="mr-2" size={18} /> Open Camera to Scan
                      </button>
                    )}

                    {authStep === 2 && isScanningQRIn && (
                      <div className="w-full rounded-lg overflow-hidden border-2 border-[#084e8d] mt-2 shadow-inner">
                        <Scanner 
                          onResult={(text) => handleQRScanInActual(text)} 
                          onError={(error) => console.log(error?.message)} 
                        />
                        <button onClick={() => setIsScanningQRIn(false)} className="w-full py-2 bg-red-500 hover:bg-red-600 transition-colors text-white text-xs font-bold">Cancel Scanner</button>
                      </div>
                    )}

                    {authStep === 3 && (
                      <div className="text-center py-2 text-[#084e8d] font-bold flex justify-center items-center text-sm">
                        <Loader2 className="animate-spin mr-2" size={18} /> Verifying Dynamic QR...
                      </div>
                    )}
                    {authStep >= 4 && <p className="text-xs text-green-600 font-semibold">Office Wi-Fi & QR Verified.</p>}
                  </div>

                  <div className="pt-2">
                    <button 
                      disabled={authStep !== 4 || apiLoading}
                      onClick={handleClockIn}
                      className={`w-full py-3.5 rounded-xl font-bold text-base transition-all transform flex justify-center items-center ${authStep === 4 ? 'bg-[#084e8d] text-white hover:bg-[#063a6b] shadow-lg shadow-[#084e8d]/20 hover:-translate-y-0.5' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                    >
                      {apiLoading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Clock className="mr-2" size={18} />}
                      {apiLoading ? 'Clocking in...' : 'Mark Attendance'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full">
              <div className="flex items-center mb-6 pb-4 border-b border-slate-100">
                <div className="bg-[#084e8d]/10 p-2 rounded-lg mr-3">
                  <User className="text-[#084e8d]" size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">My Attendance Log</h3>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-[#084e8d] text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Clock In</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Clock Out</th>
                      <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {myLogs.length > 0 ? (
                      myLogs.map((log) => (
                        <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">{log.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">{log.clockInTime}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">{log.clockOutTime}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className={`px-4 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full ${
                              log.status === 'Present' ? 'bg-green-100 text-green-800' : 
                              log.status === 'Late' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-slate-500">No attendance records found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewRole === 'admin' && (isSuperAdmin || isFounder) && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 relative">
          <div className="sticky top-0 z-40 bg-slate-50 border-b border-slate-200 p-6 flex flex-col md:flex-row justify-between items-center gap-4 rounded-t-2xl shadow-sm">
            <h3 className="text-xl font-bold text-[#084e8d] flex items-center">
              <CalendarDays className="mr-2" size={24} /> Company Attendance Log
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <select 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#084e8d]/50"
              >
                {availableDates.map(date => (
                  <option key={date} value={date}>{date === availableDates[0] ? 'Today' : date}</option>
                ))}
              </select>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search Employee Name/ID..." 
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#084e8d]/50 w-full sm:w-72 bg-white"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-b-2xl">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-[#084e8d] text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Employee Info</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Designation</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Clock In</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Clock Out</th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredAdminLogs.length > 0 ? (
                  filteredAdminLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{log.employee?.name || 'Unknown'}</span>
                          <span className="text-xs font-medium text-slate-500 mt-0.5">{log.employeeId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">{log.employee?.role || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700">{log.clockInTime}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700">{log.clockOutTime}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className={`px-4 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full ${
                          log.status === 'Present' ? 'bg-green-100 text-green-800' : 
                          log.status === 'Late' ? 'bg-amber-100 text-amber-800' : 
                          'bg-[#e9272e]/10 text-[#e9272e]'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">
                      No records found for the selected date or search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCameraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative border border-slate-200">
            <button 
              onClick={stopCamera} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 p-2 rounded-full"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-[#084e8d] mb-2 flex items-center">
              <Camera className="mr-2" size={22} /> Live Face Verification
            </h3>
            <p className="text-xs text-slate-500 mb-4">{faceStatusMsg}</p>
            <div className="relative w-full h-72 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center shadow-inner mb-6">
              {cameraLoading && (
                <div className="absolute inset-0 flex items-center justify-center text-white bg-black/50">
                  <Loader2 className="animate-spin mr-2" size={24} /> Starting Camera...
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
              className="w-full py-3 bg-[#084e8d] hover:bg-[#063a6b] text-white font-bold rounded-xl shadow-lg shadow-[#084e8d]/20 transition-all flex justify-center items-center cursor-pointer"
            >
              <ShieldCheck className="mr-2" size={20} /> Verify & Match Face
            </button>
          </div>
        </div>
      )}
    </div>
  );
}