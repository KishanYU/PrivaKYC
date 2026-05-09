import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { verifyProof } from '../lib/api';
import { safeParseJson } from '../lib/fallback';
import { TokenStatusBadge } from '../components/TokenStatusBadge';

export default function BankSimulatorPage() {
  const [proof, setProof] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const cachedProof = sessionStorage.getItem('privakyc:lastProofPayload');
    if (cachedProof && !proof) {
      setProof(cachedProof);
    }
  }, [proof]);

  const handleVerifyProof = async () => {
    setError('');
    setResult(null);

    const parsedProof = safeParseJson(proof, null);
    if (!parsedProof) {
      setError('Invalid JSON. Paste valid proof payload to verify.');
      return;
    }

    const verification = await verifyProof(parsedProof);
    setResult(verification);

    const tokenId = verification?.bankStorage?.tokenId || parsedProof?.tokenId;
    if (tokenId) {
      sessionStorage.setItem('privakyc:lastVerifiedTokenId', tokenId);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-10 sm:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Bank simulator</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">Verify proof like a bank</h1>
        </div>
        <Link
          to="/dashboard"
          className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Back to dashboard
        </Link>
      </div>

      <section className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-card">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">Paste proof JSON</label>
          <textarea
            value={proof}
            onChange={(event) => setProof(event.target.value)}
            rows={8}
            className="w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            placeholder="Paste proof JSON here..."
          />
          {error && <p className="text-sm text-rose-600">{error}</p>}
        </div>
        <button
          type="button"
          onClick={handleVerifyProof}
          className="inline-flex items-center justify-center rounded-2xl bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          Verify proof
        </button>
      </section>

      {result && (
        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-card">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Verification result</h2>
              <p className="mt-2 text-sm text-slate-500">This simulator evaluates proof validity and token revocation state before acceptance.</p>
            </div>
            <TokenStatusBadge
              status={
                result.revoked
                  ? 'REVOKED'
                  : result.verified
                    ? 'ACTIVE'
                    : 'INVALID'
              }
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Proof state</p>
              <p
                className={`mt-2 text-2xl font-semibold ${
                  result.verified ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {result.verified ? 'Valid proof' : 'Verification failed'}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Revocation status</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {result.revoked ? 'REVOKED' : result.verified ? 'ACTIVE' : 'UNKNOWN'}
              </p>
            </div>
          </div>
          <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            <p>{result.message}</p>
          </div>
        </section>
      )}
    </main>
  );
}
