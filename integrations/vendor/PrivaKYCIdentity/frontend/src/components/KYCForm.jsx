import React, { useState } from 'react';
import { initiateKyc, verifyKyc, authenticateDigilocker } from '../api';
import { ShieldCheck, CheckCircle2, ChevronRight, Lock, Database } from 'lucide-react';

const KYCForm = () => {
  const [step, setStep] = useState(1);
  const [aadhaar, setAadhaar] = useState('');
  const [otp, setOtp] = useState('');
  const [txnId, setTxnId] = useState('');
  const [loading, setLoading] = useState(false);
  const [dlLoading, setDlLoading] = useState(false);
  const [error, setError] = useState('');
  const [claims, setClaims] = useState(null);
  const [userData, setUserData] = useState(null);

  // ---- Aadhaar OTP Flow ----
  const handleInitiate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await initiateKyc(aadhaar);
      if (data.success) {
        setTxnId(data.transactionId);
        setStep(2);
      } else {
        setError(data.error || 'Failed to initiate KYC');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await verifyKyc(txnId, otp);
      if (data.success) {
        setClaims(data.claims);
        setUserData(data.userData);
        setStep(3);
      } else {
        setError(data.error || 'Failed to verify OTP');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ---- DigiLocker Flow ----
  const handleDigilocker = async () => {
    setError('');
    setDlLoading(true);

    try {
      const data = await authenticateDigilocker();
      if (data.success) {
        setClaims(data.claims);
        setUserData(data.userData);
        setStep(3);
      } else {
        setError(data.error || 'DigiLocker authentication failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'DigiLocker authentication failed.');
    } finally {
      setDlLoading(false);
    }
  };

  return (
    <div className="glass-card">
      <div className="header">
        <h1>PrivaKYC</h1>
        <p>Zero-Knowledge Identity Verification</p>
      </div>

      {/* Step 1: Choose Authentication Method */}
      {step === 1 && (
        <div className="auth-options">
          
          <button 
            type="button" 
            className="btn-primary" 
            style={{ 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
              marginBottom: '1.5rem',
              boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)'
            }}
            onClick={handleDigilocker}
            disabled={dlLoading || loading}
          >
            {dlLoading ? <div className="spinner"></div> : <><Database size={20} /> Fetch via DigiLocker</>}
          </button>

          <div style={{ textAlign: 'center', margin: '1rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            — OR ENTER MANUALLY —
          </div>

          <form onSubmit={handleInitiate}>
            <div className="form-group">
              <label>Aadhaar Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter 12-digit Aadhaar"
                value={aadhaar}
                onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                maxLength="12"
                required
              />
            </div>
            {error && <div className="error-message" style={{marginBottom: '1rem'}}>{error}</div>}
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading || dlLoading || aadhaar.length !== 12}
            >
              {loading ? <div className="spinner"></div> : 'Generate OTP'}
              {!loading && <ChevronRight size={20} />}
            </button>
          </form>
        </div>
      )}

      {/* Step 2: OTP Verification */}
      {step === 2 && (
        <form onSubmit={handleVerify}>
          <div className="form-group">
            <label>Enter OTP sent to registered mobile</label>
            <input
              type="text"
              className="form-input"
              placeholder="6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength="6"
              required
              autoFocus
            />
          </div>
          {error && <div className="error-message" style={{marginBottom: '1rem'}}>{error}</div>}
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading || otp.length !== 6}
          >
            {loading ? <div className="spinner"></div> : 'Verify Identity'}
            {!loading && <ShieldCheck size={20} />}
          </button>
        </form>
      )}

      {/* Step 3: Success & ZK Claims */}
      {step === 3 && claims && (
        <div className="success-container">
          <div className="success-icon-wrapper">
            <CheckCircle2 size={48} />
          </div>
          <h2 style={{ marginBottom: '0.5rem' }}>Identity Verified!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Welcome, {userData?.name}. Your proofs have been validated.
          </p>
          
          <div className="claims-card">
            <h3 style={{ marginBottom: '1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={16} /> Zero-Knowledge Claims
            </h3>
            
            <div className="claim-item">
              <span className="claim-label">Age &gt; 18</span>
              <span className="claim-value" style={{ color: claims.ageOver18 ? 'var(--success)' : 'var(--error)' }}>
                {claims.ageOver18 ? 'Verified True' : 'False'}
              </span>
            </div>
            
            <div className="claim-item">
              <span className="claim-label">State Verified</span>
              <span className="claim-value">
                <CheckCircle2 size={16} color="var(--success)" /> 
                {claims.stateValid ? userData?.state : 'Unverified'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KYCForm;
