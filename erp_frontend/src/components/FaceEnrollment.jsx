import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { Camera, CheckCircle2, Loader2, AlertCircle, RefreshCw, Users } from 'lucide-react';

export default function FaceEnrollment() {
  const webcamRef = useRef(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [enrollStatus, setEnrollStatus] = useState('idle'); 
  const [errorMessage, setErrorMessage] = useState('');
  
  // IT Admin Features
  const [usersList, setUsersList] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  // 1. Load AI Models & Fetch Users
  useEffect(() => {
    const initializePage = async () => {
      try {
        const MODEL_URL = '/models'; 
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        setIsModelLoaded(true);

        // Fetch Users for Admin Dropdown
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const response = await fetch('https://tra-erp-crm.onrender.com/api/auth/users', {
          headers: { Authorization: `Bearer ${userInfo?.token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setUsersList(data);
        }
      } catch (error) {
        console.error("Error loading models or users:", error);
        setErrorMessage("AI Models ya Users load nahi ho paye. Connection check karein.");
      }
    };
    initializePage();
  }, []);

  // 2. Capture and process face
  const captureAndEnroll = async () => {
    if (!webcamRef.current) return;
    
    if (!selectedUserId) {
      setErrorMessage("Pehle ek employee select karein!");
      setEnrollStatus('error');
      return;
    }

    setIsProcessing(true);
    setEnrollStatus('processing');
    setErrorMessage('');

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) throw new Error("Camera se photo capture nahi hui.");

      const img = new Image();
      img.src = imageSrc;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();

      if (!detection) {
        throw new Error("Chehra theek se detect nahi hua. Please camera mein seedhe dekhein aur light achi honi chahiye.");
      }

      const faceDescriptorArray = Array.from(detection.descriptor);
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      
      // Using the Admin API to register/re-register face
      const response = await fetch('https://tra-erp-crm.onrender.com/api/auth/admin-enroll-face', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo?.token}`
        },
        body: JSON.stringify({ 
          userId: selectedUserId, 
          faceDescriptor: faceDescriptorArray 
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setEnrollStatus('success');
      } else {
        throw new Error(data.message || "Backend par face save nahi ho paya.");
      }
    } catch (error) {
      console.error(error);
      setEnrollStatus('error');
      setErrorMessage(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setEnrollStatus('idle');
    setErrorMessage('');
    setSelectedUserId('');
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 w-full max-w-md mx-auto mt-4 sm:mt-8 mx-4 sm:mx-auto relative z-10">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-[#084e8d]">IT Face Enrollment</h3>
        <p className="text-sm text-slate-500 mt-1">Register or Re-register employee biometrics</p>
      </div>

      {!isModelLoaded ? (
        <div className="flex flex-col items-center justify-center py-12 text-[#084e8d]">
          <Loader2 className="animate-spin mb-3" size={32} />
          <p className="font-semibold text-sm">Loading AI Engine...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full">
          
          {enrollStatus !== 'success' && (
            <>
              {/* Employee Selection Dropdown */}
              <div className="w-full mb-6">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center">
                  <Users size={14} className="mr-1.5" /> Select Employee to (Re)Register
                </label>
                <select 
                  value={selectedUserId} 
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#084e8d]/20 outline-none"
                >
                  <option value="">-- Choose Employee --</option>
                  {usersList.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative rounded-xl overflow-hidden border-4 border-slate-100 shadow-inner mb-6 w-full max-w-[320px] aspect-[4/3]">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: "user" }}
                  className="w-full h-full object-cover absolute inset-0"
                />
                <div className="absolute inset-0 border-2 border-dashed border-[#084e8d]/50 m-4 sm:m-8 rounded-full pointer-events-none z-10"></div>
              </div>
            </>
          )}

          {enrollStatus === 'error' && (
            <div className="flex items-start bg-[#e9272e]/10 text-[#e9272e] p-3 rounded-lg mb-6 text-sm font-medium w-full">
              <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
              <span className="break-words">{errorMessage}</span>
            </div>
          )}

          {enrollStatus === 'success' ? (
            <div className="flex flex-col items-center justify-center py-6 text-center w-full">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-50 rounded-full flex items-center justify-center mb-4 border border-green-100">
                <CheckCircle2 className="text-green-500" size={32} />
              </div>
              <h4 className="text-base sm:text-lg font-bold text-slate-800 mb-1">Face Updated Successfully!</h4>
              <p className="text-xs sm:text-sm text-slate-500 mb-6">Employee ka naya face data system mein hamesha ke liye save ho gaya hai.</p>
              
              <button
                onClick={handleReset}
                className="w-full py-3 rounded-xl font-bold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all flex justify-center items-center"
              >
                <RefreshCw className="mr-2" size={16} /> Re-Register Another Face
              </button>
            </div>
          ) : (
            <button
              onClick={captureAndEnroll}
              disabled={isProcessing || !selectedUserId}
              className={`w-full py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all flex justify-center items-center ${isProcessing || !selectedUserId ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-[#084e8d] text-white hover:bg-[#063a6b] shadow-lg shadow-[#084e8d]/20 hover:-translate-y-0.5'}`}
            >
              {isProcessing ? (
                <><Loader2 className="animate-spin mr-2" size={18} /> Processing...</>
              ) : (
                <><Camera className="mr-2" size={18} /> Capture & Update Face</>
              )}
            </button>
          )}

        </div>
      )}
    </div>
  );
}