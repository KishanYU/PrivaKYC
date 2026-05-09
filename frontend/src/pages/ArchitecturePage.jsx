import { Link } from 'react-router-dom';

export default function ArchitecturePage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10 sm:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Architecture</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">PrivaKYC system diagram</h1>
        </div>
        <Link
          to="/dashboard"
          className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Back to dashboard
        </Link>
      </div>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-card">
        <p className="text-slate-600">This page describes the secure PrivaKYC workflow, including proof generation, on-chain token issuance, and the revocation registry that protects verifier trust.</p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-semibold text-slate-950">Core components</h2>
            <ul className="mt-4 space-y-3 text-slate-600">
              <li>1. Offline Aadhaar XML parsing in-browser</li>
              <li>2. WebAuthn device binding for biometric token control</li>
              <li>3. snarkjs proof generation with selective disclosure</li>
              <li>4. Algorand-backed token issuance and revocation registry</li>
            </ul>
          </div>
          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-semibold text-slate-950">Revocation workflow</h2>
            <ol className="mt-4 space-y-4 text-slate-600">
              <li>
                <span className="font-semibold text-slate-950">Token issuance</span> — verifier receives a limited disclosure proof linked to a KYC token.
              </li>
              <li>
                <span className="font-semibold text-slate-950">Real-time verification</span> — proof validity is checked against the revocation registry before acceptance.
              </li>
              <li>
                <span className="font-semibold text-slate-950">Secure revocation</span> — judges or administrators can revoke compromised tokens via biometric confirmation or emergency recovery.
              </li>
              <li>
                <span className="font-semibold text-slate-950">Live integration mode</span> — when the backend is available, the app uses real API calls; offline states are surfaced explicitly instead of silently swapping in mock data.
              </li>
            </ol>
          </div>
        </div>
      </section>
    </main>
  );
}
