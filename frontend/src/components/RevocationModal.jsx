import { TokenStatusBadge } from './TokenStatusBadge';

export default function RevocationModal({ open, token, status, message, onClose, onConfirm, confirmDisabled }) {
  if (!open || !token) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-rose-200 bg-white shadow-2xl">
        <div className="bg-rose-600 px-8 py-8 text-white">
          <p className="text-xs uppercase tracking-[0.35em] text-rose-100">Confirm revocation</p>
          <h2 className="mt-4 text-3xl font-semibold">Kill token permanently</h2>
          <p className="mt-3 text-sm leading-7 text-rose-100/90">
            This action is permanent. Token access is revoked from the network and local verification layer immediately.
          </p>
        </div>
        <div className="space-y-6 px-8 py-8">
          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Token</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{token.proofId || token.tokenId}</p>
                <p className="mt-1 text-sm text-slate-600">{token.tokenId}</p>
              </div>
              <TokenStatusBadge status={token.status} />
            </div>
          </div>

          {message && (
            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4">
              <p className={`text-sm ${status === 'success' ? 'text-emerald-600' : status === 'error' ? 'text-rose-600' : 'text-slate-600'}`}>
                {message}
              </p>
            </div>
          )}

          {status === 'success' && token.txId && (
            <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-700">Token successfully revoked on Algorand.</p>
              <a
                href={`https://algoexplorer.io/tx/${token.txId}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex text-sm font-semibold text-brand hover:underline"
              >
                View transaction on AlgoExplorer
              </a>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={confirmDisabled}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300 sm:w-auto"
            >
              Yes, Revoke Token
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
