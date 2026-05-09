import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { TokenStatusBadge } from '../components/TokenStatusBadge';

const sampleToken = {
  tokenId: 'TK-2A3F-9X8A',
  proofId: 'PR-1001',
  status: 'ACTIVE',
  issuedAt: '2026-05-01T10:00:00Z',
  expiresAt: '2026-05-15T10:00:00Z',
  deviceBinding: 'PrivaKYC Secure Key',
};

const proofPayload = JSON.stringify(
  {
    tokenId: sampleToken.tokenId,
    proofId: sampleToken.proofId,
    issuedAt: sampleToken.issuedAt,
    disclosed: { over18: true, state: 'Karnataka' },
  },
  null,
  2
);

export default function ShareProofPage() {
  const [token] = useState(sampleToken);
  const [expiresIn, setExpiresIn] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const diff = new Date(token.expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setExpiresIn('Expired');
        return;
      }

      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      setExpiresIn(`${days ? `${days}d ` : ''}${hours}h ${minutes}m`);
    };

    updateCountdown();
    const timer = window.setInterval(updateCountdown, 60000);
    return () => window.clearInterval(timer);
  }, [token.expiresAt]);

  const canShare = token.status === 'ACTIVE';

  const handleCopyProof = async () => {
    try {
      await navigator.clipboard.writeText(proofPayload);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const tokenFooter = useMemo(
    () => (
      <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        <p>
          Expires in: <span className="font-semibold text-slate-950">{expiresIn}</span>
        </p>
        <p className="mt-2">Device bound: {token.deviceBinding}</p>
      </div>
    ),
    [expiresIn, token.deviceBinding]
  );

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-10 sm:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Share proof</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">One-time unlinkable proof</h1>
        </div>
        <Link
          to="/dashboard"
          className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Back to dashboard
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_0.75fr]">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-slate-600">Scan this QR code to share your proof with a verifier. This proof is unlinkable and designed for one-time use.</p>
              <div className="mt-4 flex items-center gap-3">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-500">Proof</span>
                <TokenStatusBadge status={token.status} />
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              Expires in <span className="font-semibold text-slate-900">{expiresIn}</span>
            </div>
          </div>

          <div className="mx-auto mt-10 max-w-sm rounded-[1.75rem] border border-slate-200 bg-slate-50 p-8">
            <QRCode value={proofPayload} bgColor="transparent" fgColor="#2563eb" size={220} />
          </div>
          <button
            type="button"
            disabled={!canShare}
            onClick={handleCopyProof}
            className={`mt-8 inline-flex w-full items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white transition ${canShare ? 'bg-brand hover:bg-brand-dark' : 'cursor-not-allowed bg-slate-300'}`}
          >
            {copied ? 'Copied to clipboard' : 'Copy proof JSON'}
          </button>
          {!canShare && (
            <p className="mt-3 text-sm text-rose-600">Proof sharing is blocked because the token has been revoked.</p>
          )}
          {tokenFooter}
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-card">
          <h2 className="text-lg font-semibold text-slate-950">Proof details</h2>
          <div className="mt-4 space-y-4 text-sm text-slate-600">
            <p>Over 18: Yes</p>
            <p>State shared: Karnataka</p>
            <p>Gender: Verified</p>
            <p className="text-slate-500">No raw Aadhaar data is exposed during sharing.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
