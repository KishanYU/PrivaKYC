import React, { useState } from 'react';
import axios from 'axios';
import './KYCForm.css';

const KYCForm = () => {
  const [step, setStep] = useState('aadhaar'); // 'aadhaar' | 'otp' | 'success'
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [claims, setClaims] = useState(null);
  const [timer, setTimer] = useState(60);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

  // Validate Aadhaar format
  const validateAadhaar = (value) => {
    const cleaned = value.replace(/\s/g, '');
    return cleaned.length === 12 && /^\d+$/.test(cleaned);
  };

  // Step 1: Request OTP
  const handleInitiate = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateAadhaar(aadhaarNumber)) {
      setError('Please enter a valid 12-digit Aadhaar number');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/kyc/initiate`, {
        aadhaarNumber: aadhaarNumber.replace(/\s/g, '')
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data.success) {
        setTransactionId(response.data.transactionId);
        setStep('otp');
        setTimer(60);
        startTimer();
      } else {
        setError(response.data.error || 'Failed to initiate KYC');
      }
    } catch (err) {
      console.error('Initiate error:', err);
      setError(
        err.response?.data?.error || 
        'Failed to initiate KYC. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // OTP Timer
  const startTimer = () => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 2: Verify OTP
  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/kyc/verify`, {
        transactionId,
        otp: otp.replace(/\s/g, '')
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data.success) {
        setClaims(response.data.claims);
        setStep('success');
        localStorage.setItem('sessionId', response.data.sessionId);
      } else {
        setError(response.data.error || 'Failed to verify OTP');
      }
    } catch (err) {
      console.error('Verify error:', err);
      setError(
        err.response?.data?.error || 
        'Failed to verify OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setStep('aadhaar');
    setAadhaarNumber('');
    setOtp('');
    setTransactionId('');
    setClaims(null);
    setError('');
  };

  // Format Aadhaar input
  const handleAadhaarChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 12) value = value.slice(0, 12);
    
    // Format as XXXX XXXX XXXX
    if (value.length <= 4) {
      setAadhaarNumber(value);
    } else if (value.length <= 8) {
      setAadhaarNumber(`${value.slice(0, 4)} ${value.slice(4)}`);
    } else {
      setAadhaarNumber(`${value.slice(0, 4)} ${value.slice(4, 8)} ${value.slice(8)}`);
    }
  };

  // Format OTP input
  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  return (
    <div className="kyc-wrapper">
      <div className="kyc-container">
        <div className="kyc-header">
          <h1>KYC Verification</h1>
          <p className="subtitle">Verify your identity using Aadhaar OTP</p>
        </div>

        {/* Step 1: Aadhaar Entry */}
        {step === 'aadhaar' && (
          <form onSubmit={handleInitiate} className="kyc-form">
            <div className="form-group">
              <label htmlFor="aadhaar">Aadhaar Number</label>
              <div className="input-wrapper">
                <span className="prefix">🔐</span>
                <input
                  id="aadhaar"
                  type="text"
                  placeholder="XXXX XXXX XXXX"
                  value={aadhaarNumber}
                  onChange={handleAadhaarChange}
                  maxLength="14"
                  required
                  className="aadhaar-input"
                />
              </div>
              <small>12-digit Aadhaar number</small>
            </div>

            {error && (
              <div className="error-box">
                <span className="error-icon">⚠️</span>
                <p>{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading || !validateAadhaar(aadhaarNumber)}
              className="btn-primary"
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Initiating...
                </>
              ) : (
                'Get OTP'
              )}
            </button>
          </form>
        )}

        {/* Step 2: OTP Entry */}
        {step === 'otp' && (
          <form onSubmit={handleVerify} className="kyc-form">
            <div className="otp-info">
              <p className="info-icon">📱</p>
              <p className="info-text">
                OTP has been sent to your registered mobile number
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="otp">Enter OTP</label>
              <div className="input-wrapper">
                <span className="prefix">🔑</span>
                <input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={handleOtpChange}
                  maxLength="6"
                  required
                  className="otp-input"
                />
              </div>
              <small>6-digit code sent to your phone</small>
            </div>

            {error && (
              <div className="error-box">
                <span className="error-icon">⚠️</span>
                <p>{error}</p>
              </div>
            )}

            <div className="timer-section">
              {timer > 0 ? (
                <p className="timer">
                  Resend OTP in <strong>{timer}s</strong>
                </p>
              ) : (
                <button type="button" className="btn-link">
                  Resend OTP
                </button>
              )}
            </div>

            <div className="button-group">
              <button 
                type="submit" 
                disabled={loading || otp.length !== 6}
                className="btn-primary"
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </button>
              <button 
                type="button" 
                onClick={() => setStep('aadhaar')}
                className="btn-secondary"
              >
                Back
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Success */}
        {step === 'success' && claims && (
          <div className="success-container">
            <div className="success-icon">✓</div>
            <h2>KYC Verified!</h2>
            <p className="success-message">
              Your identity has been verified successfully
            </p>

            <div className="claims-display">
              <div className="claim-item">
                <span className="claim-label">Age Status</span>
                <span className="claim-value age">
                  {claims.ageOver18 ? '✓ 18+ Years' : '✗ Below 18'}
                </span>
              </div>

              <div className="claim-item">
                <span className="claim-label">State</span>
                <span className="claim-value">{claims.state}</span>
              </div>

              <div className="claim-item">
                <span className="claim-label">User ID</span>
                <span className="claim-value hash">
                  {claims.userHash.substring(0, 24)}...
                </span>
              </div>
            </div>

            <div className="success-footer">
              <p className="security-note">
                🔒 Your personal data has been securely processed and not stored
              </p>
              <button onClick={handleReset} className="btn-primary">
                Verify Another
              </button>
            </div>
          </div>
        )}

        <div className="kyc-footer">
          <small>
            This service is powered by Setu e-KYC and complies with UIDAI guidelines
          </small>
        </div>
      </div>
    </div>
  );
};

export default KYCForm;