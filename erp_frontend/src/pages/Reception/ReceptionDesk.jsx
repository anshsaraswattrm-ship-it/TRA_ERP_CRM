import { useState, useEffect } from 'react';
import { Monitor, ShieldCheck, RefreshCw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function ReceptionDesk() {
  const [qrData, setQrData] = useState('');
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

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

  useEffect(() => {
    fetchQR();
    const interval = setInterval(fetchQR, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full min-h-[80vh] flex flex-col items-center justify-center px-4 py-6 sm:py-8">
      <div className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200 max-w-lg w-full text-center mx-auto">
        <div className="inline-flex bg-[#084e8d]/10 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-[#084e8d] mb-4">
          <Monitor className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Reception Attendance Kiosk</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 sm:mt-2 mb-6 sm:mb-8 px-2">Scan this QR code using your employee attendance portal to verify office presence.</p>

        <div className="bg-slate-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-100 flex flex-col items-center justify-center mb-6 shadow-inner">
          <div className="w-48 h-48 sm:w-56 sm:h-56 bg-white border-2 sm:border-4 border-slate-800 rounded-xl flex items-center justify-center p-3 sm:p-4 shadow-md overflow-hidden">
            {qrData ? (
              <div className="w-full h-full flex items-center justify-center">
                <QRCodeSVG value={qrData} style={{ width: '100%', height: '100%' }} />
              </div>
            ) : (
              <span className="text-xs sm:text-sm text-slate-400 font-bold">Loading Code...</span>
            )}
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-emerald-600 mt-4 flex items-center justify-center text-center">
            <ShieldCheck size={14} className="mr-1 flex-shrink-0" /> Secure Office Terminal Active
          </span>
        </div>

        <button 
          onClick={fetchQR}
          className="text-[11px] sm:text-xs font-bold text-slate-500 hover:text-[#084e8d] flex items-center justify-center mx-auto transition-colors p-2"
        >
          <RefreshCw size={14} className="mr-1.5 flex-shrink-0" /> Refresh Terminal Token
        </button>
      </div>
    </div>
  );
}