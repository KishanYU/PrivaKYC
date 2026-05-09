import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const MockDigiLocker = () => {
  const [pin, setPin] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const state = searchParams.get('state') || 'demo_state';

  const handleLogin = () => {
    setIsLoggingIn(true);
    setTimeout(() => {
      // Redirect back to our backend callback with a fake code
      window.location.href = `http://localhost:5000/api/digilocker/callback?code=HACKATHON_DEMO_CODE_${Math.random().toString(36).substring(7)}&state=${state}`;
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header Mimic */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src="https://web.digilocker.gov.in/public/img/logo.png" alt="DigiLocker" className="h-10" />
          <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
          <img src="https://web.digilocker.gov.in/public/img/digit-india.png" alt="Digital India" className="h-10 hidden sm:block" />
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Government of India</p>
          <p className="text-xs text-slate-400">Department of Electronics & IT</p>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
          <div className="bg-blue-600 p-8 text-center">
            <h1 className="text-2xl font-bold text-white">Sign In to your account</h1>
            <p className="text-blue-100 mt-2">Access your verified documents ephemerally</p>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Aadhaar / Mobile Number</label>
              <input 
                type="text" 
                placeholder="XXXX-XXXX-XXXX" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                defaultValue="2318-9200-4455"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">6 Digit Security PIN</label>
              <div className="flex gap-2">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="flex-1 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-xl text-slate-400">●</div>
                ))}
              </div>
            </div>

            <button 
              onClick={handleLogin}
              disabled={isLoggingIn}
              className={`w-full py-4 rounded-2xl bg-blue-600 text-white font-bold text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 transition transform active:scale-95 flex items-center justify-center gap-3 ${isLoggingIn ? 'opacity-70' : ''}`}
            >
              {isLoggingIn ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="pt-4 text-center">
              <p className="text-sm text-slate-500">New to DigiLocker? <span className="text-blue-600 font-bold cursor-pointer">Sign Up</span></p>
            </div>
          </div>

          <div className="bg-slate-50 p-6 border-t border-slate-100 flex items-center gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04a11.357 11.357 0 00-1.173 4.593c0 3.858 1.817 7.277 4.616 9.416a11.923 11.923 0 0010.35 0c2.799-2.139 4.616-5.558 4.616-9.416a11.357 11.357 0 00-1.173-4.593z"></path></svg>
            </div>
            <p className="text-xs text-slate-500 leading-tight">
              Authenticated by <strong>Digital India</strong>. Your data is never stored by the requesting application without explicit consent.
            </p>
          </div>
        </div>
      </main>

      <footer className="p-8 text-center text-slate-400 text-xs">
        <div className="flex justify-center gap-6 mb-4">
          <span>Terms of Service</span>
          <span>Privacy Policy</span>
          <span>Help Desk</span>
        </div>
        <p>&copy; 2026 National Informatics Centre (NIC)</p>
      </footer>
    </div>
  );
};

export default MockDigiLocker;
