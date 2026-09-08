import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { Camera, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export default function FaceEnrollment() {
  const webcamRef = useRef(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [enrollStatus, setEnrollStatus] = useState('idle'); // idle, processing, success, error
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Load AI Models from public/models folder
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models'; 
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        setIsModelLoaded(true);
      } catch (error) {
        console.error("Error loading models:", error);
        setErrorMessage("AI Models load nahi ho paye. Models folder check karein.");
      }
    };
    loadModels();
  }, []);

  // 2. Capture and process face
  const captureAndEnroll = async () => {
    if (!webcamRef.current) return;
    
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
      const response = await fetch('https://tra-erp-crm.onrender.com/api/auth/enroll-face', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo?.token}`
        },
        body: JSON.stringify({ faceDescriptor: faceDescriptorArray })
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

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 w-full max-w-md mx-auto mt-4 sm:mt-8 mx-4 sm:mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-[#084e8d]">Biometric Enrollment</h3>
        <p className="text-sm text-slate-500 mt-1">Apna chehra system mein register karein</p>
      </div>

      {!isModelLoaded ? (
        <div className="flex flex-col items-center justify-center py-12 text-[#084e8d]">
          <Loader2 className="animate-spin mb-3" size={32} />
          <p className="font-semibold text-sm">Loading AI Engine...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full">
          
          {enrollStatus !== 'success' && (
            <div className="relative rounded-xl overflow-hidden border-4 border-slate-100 shadow-inner mb-6 w-full max-w-[320px] aspect-[4/3]">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "user" }}
                className="w-full h-full object-cover absolute inset-0"
              />
              {/* Face Guide Overlay */}
              <div className="absolute inset-0 border-2 border-dashed border-[#084e8d]/50 m-4 sm:m-8 rounded-full pointer-events-none z-10"></div>
            </div>
          )}

          {enrollStatus === 'error' && (
            <div className="flex items-start bg-[#e9272e]/10 text-[#e9272e] p-3 rounded-lg mb-6 text-sm font-medium w-full">
              <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
              <span className="break-words">{errorMessage}</span>
            </div>
          )}

          {enrollStatus === 'success' ? (
            <div className="flex flex-col items-center justify-center py-8 text-center px-2">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-50 rounded-full flex items-center justify-center mb-4 border border-green-100">
                <CheckCircle2 className="text-green-500" size={32} />
              </div>
              <h4 className="text-base sm:text-lg font-bold text-slate-800 mb-1">Face Enrolled!</h4>
              <p className="text-xs sm:text-sm text-slate-500">Aapka face attendance system ke liye successfully register ho gaya hai.</p>
            </div>
          ) : (
            <button
              onClick={captureAndEnroll}
              disabled={isProcessing}
              className={`w-full py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all flex justify-center items-center ${isProcessing ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-[#084e8d] text-white hover:bg-[#063a6b] shadow-lg shadow-[#084e8d]/20 hover:-translate-y-0.5'}`}
            >
              {isProcessing ? (
                <><Loader2 className="animate-spin mr-2" size={18} /> Processing...</>
              ) : (
                <><Camera className="mr-2" size={18} /> Capture & Save Face</>
              )}
            </button>
          )}

        </div>
      )}
    </div>
  );
}