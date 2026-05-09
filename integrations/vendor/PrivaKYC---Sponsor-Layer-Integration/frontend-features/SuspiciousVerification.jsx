import React, { useState } from 'react';
import axios from 'axios';

const SuspiciousVerification = () => {
  const [userId, setUserId] = useState(() => 'user-' + Math.random().toString(36).substring(7));
  const [verificationState, setVerificationState] = useState('initial'); // initial | verifying | success | blocked
  
  // Risk Simulation Signals
  const [signals, setSignals] = useState({
    revokedProofReuse: false,
    newDevice: false,
    ipMismatch: false,
    highFrequencyRequests: false,
    repeatedVoiceFailure: false
  });

  const [activeProfile, setActiveProfile] = useState('ALICE');

  const [challenge, setChallenge] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | recording | verifying | result
  const [result, setResult] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [timeLeft, setTimeLeft] = useState(4);
  const [browserTranscript, setBrowserTranscript] = useState('');

  const applyProfile = (profile) => {
    setActiveProfile(profile);
    if (profile === 'ALICE') {
      setSignals({ revokedProofReuse: false, newDevice: false, ipMismatch: false, highFrequencyRequests: false, repeatedVoiceFailure: false });
      setUserId('user-alice82');
    } else if (profile === 'BOB') {
      // 50 (Revoked) + 15 (IP) = 65 (HIGH RISK)
      setSignals({ revokedProofReuse: true, newDevice: false, ipMismatch: true, highFrequencyRequests: false, repeatedVoiceFailure: false });
      setUserId('user-bob99');
    } else if (profile === 'BOTNET') {
      // 20 (Device) + 15 (IP) + 25 (Velocity) + 30 (Repeated Voice) = 90 (HIGH RISK)
      setSignals({ revokedProofReuse: false, newDevice: true, ipMismatch: true, highFrequencyRequests: true, repeatedVoiceFailure: true });
      setUserId('user-bot404');
    }
  };

  const initiateVerification = async (customSignals = signals) => {
    // If the proof is revoked, trigger a Snowflake fraud alert instantly
    if (customSignals.revokedProofReuse) {
      try {
        await axios.post('http://localhost:3000/api/sponsors/fraud/log', {
          alertType: 'REVOKED_PROOF_REUSE',
          bankId: 'Partner Institution #44',
          nullifierHash: userId,
          riskScore: 95
        });
      } catch (err) {
        console.error('Failed to log fraud alert', err);
      }
    }

    try {
      // 1. Send ZK Proof verification request to backend Risk Engine
      const riskRes = await axios.post('http://localhost:3000/api/sponsors/verify-proof', {
        userId,
        signals: customSignals
      });

      const { action, riskScore, riskLevel } = riskRes.data;

      // 2. Handle Risk Engine Decision
      if (action === 'VERIFICATION_SUCCESS') {
        // Bypass Voice Liveness completely!
        setResult({ riskScore, riskLevel, transcript: 'Bypassed (Low Risk)' });
        setVerificationState('success');
      } else if (action === 'REQUIRE_VOICE_LIVENESS') {
        // Risk too high -> Trigger ElevenLabs
        setResult({ riskScore, riskLevel }); // Store the initial risk score
        setVerificationState('verifying');
        setStatus('idle');
        
        const challengeRes = await axios.post('http://localhost:3000/api/sponsors/voice/challenge', { userId });
        setChallenge(challengeRes.data.challenge);
      }
    } catch (err) {
      console.error('Risk Engine Verification Failed', err);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      let tempTranscript = '';

      // Initialize Web Speech API as fallback for ElevenLabs
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      let recognition = null;
      if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.onresult = (event) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          tempTranscript = currentTranscript;
        };
        recognition.start();
      }

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        if (recognition) recognition.stop();
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        setAudioChunks([]);
        verifyAudio(audioBlob, tempTranscript);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setStatus('recording');
      setTimeLeft(4);

      // Auto-stop logic
      let currentLeft = 4;
      const timer = setInterval(() => {
        currentLeft -= 1;
        setTimeLeft(currentLeft);
        if (currentLeft <= 0) {
          clearInterval(timer);
          if (recorder.state !== 'inactive') {
            recorder.stop();
          }
        }
      }, 1000);

    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Microphone access denied or unavailable.');
    }
  };

  const verifyAudio = async (audioBlob, transcriptText) => {
    setStatus('verifying');
    try {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('audio', audioBlob, 'recording.webm');
      if (transcriptText) {
        formData.append('fallbackTranscript', transcriptText);
      }

      const res = await axios.post('http://localhost:3000/api/sponsors/voice/verify', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setResult(res.data);
      setStatus('result');
      
      if (res.data.verified) {
        setVerificationState('success');
      } else {
        setVerificationState('blocked');
      }
    } catch (err) {
      console.error(err);
      setStatus('result');
      setVerificationState('blocked');
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-5 border-b border-gray-700 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-600">
            <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Identity Verification</h2>
            <p className="text-sm text-gray-400">Zero-Knowledge Proof (ZKP) Request</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {verificationState === 'initial' && (
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Verification Type</span>
                <span className="font-semibold text-gray-900">Aadhaar ZKP KYC</span>
              </div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-600">User Anonymity Hash</span>
                <span className="font-mono text-sm text-gray-500">{userId}</span>
              </div>
              
              <div className="border-t border-gray-200 pt-5 mt-4">
                <span className="text-sm font-semibold text-gray-700 block mb-4">Select Demo Scenario</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button 
                    onClick={() => applyProfile('ALICE')}
                    className={`p-3 rounded-lg border text-left transition-all ${activeProfile === 'ALICE' ? 'border-green-500 bg-green-50 ring-1 ring-green-500' : 'border-gray-200 hover:border-green-300'}`}
                  >
                    <div className="font-semibold text-gray-900 text-sm">Normal User</div>
                    <div className="text-xs text-gray-500 mt-1">Typical Risk (3-7)</div>
                    <div className="text-[10px] text-gray-400 mt-1 leading-tight">Scenario Description: Frictionless flow; bypasses extra security.</div>
                  </button>
                  <button 
                    onClick={() => applyProfile('BOB')}
                    className={`p-3 rounded-lg border text-left transition-all ${activeProfile === 'BOB' ? 'border-red-500 bg-red-50 ring-1 ring-red-500' : 'border-gray-200 hover:border-red-300'}`}
                  >
                    <div className="font-semibold text-gray-900 text-sm">Stolen Proof</div>
                    <div className="text-xs text-gray-500 mt-1">High Risk (65-70)</div>
                    <div className="text-[10px] text-gray-400 mt-1 leading-tight">Scenario Description: Triggers Snowflake Fraud Alert instantly.</div>
                  </button>
                  <button 
                    onClick={() => applyProfile('BOTNET')}
                    className={`p-3 rounded-lg border text-left transition-all ${activeProfile === 'BOTNET' ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500' : 'border-gray-200 hover:border-purple-300'}`}
                  >
                    <div className="font-semibold text-gray-900 text-sm">Botnet Attack</div>
                    <div className="text-xs text-gray-500 mt-1">Extreme Risk (85-95)</div>
                    <div className="text-[10px] text-gray-400 mt-1 leading-tight">Scenario Description: Demands ElevenLabs Voice Verification.</div>
                  </button>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => initiateVerification(signals)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Verify Identity (ZKP)
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
          </div>
        )}

        {verificationState === 'verifying' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
              <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              <div>
                <p className="font-semibold flex justify-between items-center">
                  Suspicious Verification Detected
                  <span className="text-xs bg-yellow-200 px-2 py-0.5 rounded-full font-bold">Score: {result?.riskScore}</span>
                </p>
                <p className="text-sm">
                  {signals.revokedProofReuse 
                    ? 'Risk Engine: Revoked proof reuse detected. Fraud alert generated. Voice Liveness required.'
                    : 'Risk Engine: Abnormal verification behavior detected. Voice Liveness required.'}
                </p>
              </div>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg border border-purple-100 text-center">
              <p className="text-sm text-purple-600 mb-2">Please read the following code clearly:</p>
              <p className="text-5xl font-mono font-bold text-purple-900 tracking-widest">{challenge}</p>
            </div>

            {status === 'idle' && (
              <button
                onClick={startRecording}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                Start Recording Voice
              </button>
            )}

            {status === 'recording' && (
              <div className="w-full bg-red-50 border border-red-200 text-red-700 font-medium py-3.5 rounded-lg flex items-center justify-center gap-2 animate-pulse">
                <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                Recording... Speak Now ({timeLeft}s)
              </div>
            )}

            {status === 'verifying' && (
              <div className="w-full bg-blue-50 text-blue-700 font-medium py-3.5 rounded-lg flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing with ElevenLabs...
              </div>
            )}
          </div>
        )}

        {verificationState === 'success' && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Verification Successful</h3>
            <p className="text-gray-600 mb-6">Identity confirmed securely. ZK Proof accepted.</p>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left inline-block w-full max-w-sm">
              <p className="text-sm text-gray-500 mb-1">ElevenLabs Liveness Check</p>
              <p className="font-medium text-gray-900 block mb-1">"{result?.transcript}"</p>
              <p className="text-xs text-green-600">Risk Score: {result?.riskScore} (Low Risk)</p>
            </div>

            <button onClick={() => setVerificationState('initial')} className="mt-8 text-blue-600 hover:underline font-medium">
              Start New Verification
            </button>
          </div>
        )}

        {verificationState === 'blocked' && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Verification Blocked</h3>
            <p className="text-red-600 font-medium mb-2">Fraud Alert: Voice Liveness Failed</p>
            <p className="text-gray-600 mb-6">This identity attempt has been blocked and logged to Snowflake & Backbone.io.</p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left inline-block w-full max-w-sm">
              <p className="text-sm text-red-500 mb-1">ElevenLabs Liveness Check</p>
              <p className="font-medium text-red-900 block mb-1">Transcript: "{result?.transcript || 'Processing Error'}"</p>
              <p className="text-xs text-red-700 font-bold">Risk Score: {result?.riskScore || 100} (High Risk)</p>
            </div>

            <button onClick={() => setVerificationState('initial')} className="mt-8 text-blue-600 hover:underline font-medium">
              Simulate Another Block
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuspiciousVerification;
