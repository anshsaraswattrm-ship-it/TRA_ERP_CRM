import { useState, useEffect, useRef } from 'react';
import { Camera, ShieldCheck, Loader2, UserCheck, X } from 'lucide-react';
import * as faceapi from 'face-api.js';

export default function ITFaceRegistration() {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // Camera & Face API states
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [faceStatusMsg, setFaceStatusMsg] = useState('');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const videoRef = useRef(null);

  // Fetch all employees on mount
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await fetch('https://tra-erp-crm.onrender.com/api/auth/users', {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo?.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
          if (data.length > 0) setSelectedUserId(data[0]._id);
        }
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();

    // Load face-api models
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error("Failed to load AI models", err);
      }
    };
    loadModels();
  }, []);

  const startCamera = () => {
    if (!selectedUserId) {
      alert("Please select an employee first!");
      return;
    }
    setShowCameraModal(true);
    setCameraLoading(true);
    setFaceStatusMsg('Initializing IT Kiosk Camera...');

    navigator.mediaDevices.getUserMedia({ video: {} })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraLoading(false);
        setFaceStatusMsg('Camera ready. Ask employee to look straight into the camera.');
      })
      .catch((err) => {
        console.error("Camera error:", err);
        setCameraLoading(false);
        setFaceStatusMsg('Camera access denied.');
      });
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowCameraModal(false);
  };

  const captureAndRegisterFace = async () => {
    if (!modelsLoaded) {
      alert("AI models are still loading. Please wait.");
      return;
    }

    setApiLoading(true);
    setFaceStatusMsg('Detecting face & generating biometric descriptor...');

    try {
      const detection = await faceapi.detectSingleFace(
        videoRef.current, 
        new faceapi.SsdMobilenetv1Options()
      ).withFaceLandmarks().withFaceDescriptor();

      if (!detection) {
        alert("No face detected clearly! Please adjust position.");
        setApiLoading(false);
        return;
      }

      const descriptorArray = Array.from(detection.descriptor);

      // Send to Admin enrollment route
      const res = await fetch('https://tra-erp-crm.onrender.com/api/auth/admin-enroll-face', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo?.token}`
        },
        body: JSON.stringify({ userId: selectedUserId, faceDescriptor: descriptorArray })
      });

      const data = await res.json();
      if (res.ok) {
        alert("Face successfully registered for the employee!");
        stopCamera();
      } else {
        alert(data.message || 'Failed to register face');
      }
    } catch (err) {
      console.error("Registration error:", err);
      alert("Error during face registration.");
    } finally {
      setApiLoading(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-12 pt-4">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#084e8d] tracking-tight">IT Biometric Enrollment Kiosk</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">Register or update employee facial recognition descriptors securely from IT Desk</p>
      </div>

      <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-sm border border-slate-200 w-full max-w-xl">
        <div className="flex items-center mb-6 pb-4 border-b border-slate-100">
          <div className="bg-[#084e8d]/10 p-2.5 rounded-xl mr-3 flex-shrink-0">
            <UserCheck className="text-[#084e8d]" size={24} />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800 leading-tight">Select Employee for Enrollment</h3>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Choose Employee</label>
            {loadingUsers ? (
              <div className="flex items-center text-sm text-slate-500"><Loader2 className="animate-spin mr-2" size={16} /> Loading employees...</div>
            ) : (
              <select 
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#084e8d]/50"
              >
                {users.map(u => (
                  <option key={u._id} value={u._id}>{u.name} ({u.employeeId} - {u.role})</option>
                ))}
              </select>
            )}
          </div>

          <button 
            onClick={startCamera}
            disabled={!modelsLoaded || users.length === 0}
            className="w-full py-3.5 bg-[#084e8d] hover:bg-[#063a6b] text-white font-bold rounded-xl shadow-lg shadow-[#084e8d]/20 transition-all flex justify-center items-center text-sm sm:text-base"
          >
            <Camera className="mr-2 flex-shrink-0" size={20} /> Open IT Kiosk Camera & Capture
          </button>
        </div>
      </div>

      {/* Camera Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6 relative border border-slate-200">
            <button onClick={stopCamera} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 p-2 rounded-full">
              <X size={20} />
            </button>

            <h3 className="text-lg sm:text-xl font-bold text-[#084e8d] mb-2 flex items-center pr-8">
              <Camera className="mr-2 flex-shrink-0" size={22} /> IT Facial Enrollment
            </h3>
            <p className="text-xs text-slate-500 mb-4">{faceStatusMsg}</p>

            <div className="relative w-full h-64 sm:h-72 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center shadow-inner mb-6">
              {cameraLoading && (
                <div className="absolute inset-0 flex items-center justify-center text-white bg-black/50 text-sm">
                  <Loader2 className="animate-spin mr-2" size={24} /> Starting Camera...
                </div>
              )}
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform -scale-x-100" />
            </div>

            <button 
              onClick={captureAndRegisterFace}
              disabled={apiLoading || cameraLoading}
              className="w-full py-3 bg-[#084e8d] hover:bg-[#063a6b] text-white font-bold rounded-xl shadow-lg shadow-[#084e8d]/20 transition-all flex justify-center items-center text-sm sm:text-base"
            >
              {apiLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : <ShieldCheck className="mr-2" size={20} />}
              {apiLoading ? 'Registering Face...' : 'Register Face in Database'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}