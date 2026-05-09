import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAccessLogs, getActiveTokens, getStatus } from '../lib/api';
import { formatDateTime } from '../lib/fallback';

export default function CompliancePage() {
  const [statusData, setStatusData] = useState(null);
  const [tokenCounts, setTokenCounts] = useState({ total: 0, active: 0, revoked: 0 });
  const [latestLogs, setLatestLogs] = useState([]);
  const [latestTokenId, setLatestTokenId] = useState('');

  useEffect(() => {
    const loadCompliance = async () => {
      try {
        const [statusResult, tokenResult] = await Promise.all([getStatus(), getActiveTokens()]);
        setStatusData(statusResult?.data || statusResult);
        const tokens = Array.isArray(tokenResult?.tokens) ? tokenResult.tokens : [];
        const active = tokens.filter((token) => token.status === 'ACTIVE').length;
        const revoked = tokens.filter((token) => token.status === 'REVOKED').length;
        setTokenCounts({ total: tokens.length, active, revoked });

        const newestToken = tokens[0]?.tokenId || sessionStorage.getItem('privakyc:lastTokenId');
        if (newestToken) {
          setLatestTokenId(newestToken);
          const logsResult = await getAccessLogs(newestToken);
          setLatestLogs(logsResult?.logs || []);
        }
      } catch {
        setStatusData(null);
      }
    };

    loadCompliance();
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10 sm:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Compliance</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">Traditional KYC vs PrivaKYC</h1>
        </div>
        <Link
          to="/dashboard"
          className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Back to dashboard
        </Link>
      </div>

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-card">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Registry</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{tokenCounts.total}</p>
          <p className="mt-2 text-sm text-slate-600">Live tokens currently stored in MongoDB.</p>
        </div>
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-card">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Active</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-600">{tokenCounts.active}</p>
          <p className="mt-2 text-sm text-slate-600">Tokens ready for bank verification.</p>
        </div>
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-card">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Revoked</p>
          <p className="mt-3 text-3xl font-semibold text-rose-600">{tokenCounts.revoked}</p>
          <p className="mt-2 text-sm text-slate-600">Compromised credentials blocked at the ledger layer.</p>
        </div>
      </section>

      {statusData && (
        <div className="mb-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-card">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Backend status</p>
          <p className="mt-3 text-lg font-semibold text-slate-950">{statusData?.message || 'Live backend connected'}</p>
        </div>
      )}

      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-card">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Traditional KYC</th>
              <th className="px-6 py-4">PrivaKYC</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-200 bg-white">
              <td className="px-6 py-5 font-medium text-slate-900">Data retention</td>
              <td className="px-6 py-5">Raw Aadhaar stored in bank systems</td>
              <td className="px-6 py-5">Only cryptographic proofs saved, no raw data</td>
            </tr>
            <tr className="border-t border-slate-200 bg-slate-50">
              <td className="px-6 py-5 font-medium text-slate-900">Privacy</td>
              <td className="px-6 py-5">Full identity exposure</td>
              <td className="px-6 py-5">Selective disclosure by design</td>
            </tr>
            <tr className="border-t border-slate-200 bg-white">
              <td className="px-6 py-5 font-medium text-slate-900">Compliance</td>
              <td className="px-6 py-5">Conflicting RBI/PMLA retention rules</td>
              <td className="px-6 py-5">DPDP-aligned minimal storage</td>
            </tr>
            <tr className="border-t border-slate-200 bg-slate-50">
              <td className="px-6 py-5 font-medium text-slate-900">Fraud risk</td>
              <td className="px-6 py-5">Mule accounts and credential reuse</td>
              <td className="px-6 py-5">Device-bound proofs with fast revocation</td>
            </tr>
          </tbody>
        </table>
      </div>

      {latestTokenId && (
        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-card">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Auditor trail</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Latest access log for {latestTokenId}</h2>
            </div>
            <p className="text-sm text-slate-500">Pulled directly from the compliance API.</p>
          </div>
          <div className="mt-6 space-y-3">
            {latestLogs.length === 0 && <p className="text-sm text-slate-500">No access events recorded yet.</p>}
            {latestLogs.map((log) => (
              <div key={`${log._id || log.timestamp}-${log.status}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-950">{log.verifierName}</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' : log.status === 'REJECTED_REVOKED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                    {log.status}
                  </span>
                </div>
                <p className="mt-2 text-slate-500">{formatDateTime(log.timestamp)}</p>
                {log.ipAddress && <p className="mt-1 text-slate-500">IP: {log.ipAddress}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
