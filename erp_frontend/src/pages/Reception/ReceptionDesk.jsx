import { useState, useEffect, useRef } from 'react';
import { Monitor, ShieldCheck, RefreshCw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function ReceptionDesk() {
  const [qrData, setQrData] = useState('');
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  
  const scannedString = useRef('');

  const fetchQR = async () => {
    try {
      const res = await fetch('https://tra-erp-crm.onrender.com/api/attendance/reception-qr', {
        headers: { Authorization: `Bearer ${userInfo?.token}` }
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setQrData(data.token);
      }
    } catch (err) {
      console.error("Error fetching reception QR", err);
    }
  };

  const handleScan = async (scannedData) => {
    if (scannedData) {
      console.log("🔍 Scanned QR Raw Data:", scannedData);
      try {
        const response = await fetch('https://tra-erp-crm.onrender.com/api/attendance/verify-qr', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userInfo?.token}`
          },
          body: JSON.stringify({ qrData: scannedData })
        });
        
        const data = await response.json();
        console.log("✅ Backend Response Data:", data);
        
        if(response.ok) {
          console.log("🎉 Attendance Marked Successfully!");
        } else {
          console.error("⚠️ Backend Error Message:", data.message || data.error || data);
        }

      } catch (error) {
        console.error("❌ API Error:", error);
      }
    }
  };

  useEffect(() => {
    fetchQR();
    const interval = setInterval(fetchQR, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        if (scannedString.current.length > 5) {
          handleScan(scannedString.current);
        }
        scannedString.current = '';
      } else if (e.key.length === 1) {
        scannedString.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="w-full min-h-[80vh] flex flex-col items-center justify-center px-4 py-8">
      <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-200 max-w-lg w-full text-center">
        <div className="inline-flex bg-[#084e8d]/10 p-4 rounded-2xl text-[#084e8d] mb-4">
          <Monitor size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Reception Attendance Kiosk</h2>
        <p className="text-sm text-slate-500 mt-1 mb-8">Scan this QR code using your employee attendance portal to verify office presence.</p>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center justify-center mb-6 shadow-inner">
          <div className="w-56 h-56 bg-white border-4 border-slate-800 rounded-xl flex items-center justify-center p-4 shadow-md overflow-hidden">
            {qrData ? (
              <QRCodeSVG value={qrData} size={180} />
            ) : (
              <span className="text-sm text-slate-400 font-bold">Loading Code...</span>
            )}
          </div>
          <span className="text-xs font-bold text-emerald-600 mt-4 flex items-center">
            <ShieldCheck size={14} className="mr-1" /> Secure Office Terminal Active
          </span>
        </div>

        <div className="flex justify-between items-center w-full px-4">
          <button 
            onClick={fetchQR}
            className="text-xs font-bold text-slate-500 hover:text-[#084e8d] flex items-center transition-colors"
          >
            <RefreshCw size={14} className="mr-1.5" /> Refresh Terminal
          </button>
          
          <button 
            onClick={() => handleScan(qrData)}
            className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded hover:bg-amber-100 transition-colors"
          >
            TEST SCAN (F12)
          </button>
        </div>
      </div>
    </div>
  );
}