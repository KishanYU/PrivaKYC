import React from 'react'
import SuspiciousVerification from '../../frontend-features/SuspiciousVerification'
import FraudDashboard from '../../frontend-features/FraudDashboard'
import AgentMemory from '../../frontend-features/AgentMemory'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-2">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">PrivaKYC</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Zero-Knowledge Proof Identity Platform demonstrating AI Voice Liveness, Shared Fraud Intelligence, and Immutable Compliance Logging.
          </p>
        </header>

        {/* 1. Suspicious Verification Flow (ElevenLabs) */}
        <section className="mb-12">
          <SuspiciousVerification />
        </section>

        {/* 2. Fraud Dashboard (Snowflake) */}
        <section className="mb-12">
          <FraudDashboard />
        </section>

        {/* 3. Immutable Audit Logs (Backbone.io) */}
        <section className="mb-12">
          <AgentMemory />
        </section>
      </div>
    </div>
  )
}

export default App
