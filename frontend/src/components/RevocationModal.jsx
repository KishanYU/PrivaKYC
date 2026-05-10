import { TokenStatusBadge } from './TokenStatusBadge';

export default function RevocationModal({ open, token, status, message, onClose, onConfirm, confirmDisabled, walletConnected, n8nStatus }) {
  if (!open || !token) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-rose-200 bg-white shadow-2xl">
        <div className="bg-rose-600 px-8 py-8 text-white">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.35em] text-rose-100">Confirm revocation</p>
            {walletConnected && (
              <span className="flex items-center gap-2 rounded-full bg-rose-500/50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400"></span>
                Para Wallet Linked
              </span>
            )}
          </div>
          <h2 className="mt-4 text-3xl font-semibold">Kill token permanently</h2>
          <p className="mt-3 text-sm leading-7 text-rose-100/90">
            This action is permanent. Token access is revoked from the network and local verification layer immediately.
          </p>
        </div>
        <div className="space-y-6 px-8 py-8">
          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Token ID</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{token.proofId || token.tokenId}</p>
                <p className="mt-1 text-sm text-slate-600 truncate max-w-[200px]">{token.tokenId}</p>
              </div>
              <TokenStatusBadge status={token.status} />
            </div>
          </div>

          {status === 'pending' && (
            <div className="rounded-[1.75rem] border border-brand/20 bg-brand/5 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand mb-4">
                <svg className="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h4 className="font-semibold text-slate-900">Waiting for Pera Wallet</h4>
              <p className="mt-2 text-sm text-slate-600">Please open the Para Wallet app on your phone and accept the revocation transaction.</p>
            </div>
          )}

          {message && status !== 'pending' && (
            <div className={`rounded-[1.75rem] border p-4 ${status === 'success' ? 'border-emerald-200 bg-emerald-50' : status === 'error' ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-slate-50'}`}>
              <p className={`text-sm ${status === 'success' ? 'text-emerald-700' : status === 'error' ? 'text-rose-700' : 'text-slate-600'}`}>
                {message}
              </p>
            </div>
          )}

          {status === 'success' && (
             <div className="space-y-4">
               {token.txId && (
                <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm font-semibold text-emerald-700">Token successfully revoked on Algorand.</p>
                  <a
                    href={`https://testnet.algoscan.app/tx/${token.txId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
                  >
                    View on Algoscan
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                  </a>
                </div>
               )}

               {n8nStatus !== 'idle' && (
                 <div className={`rounded-[1.75rem] border p-4 flex items-center justify-between ${n8nStatus === 'success' ? 'border-indigo-200 bg-indigo-50' : 'border-slate-200 bg-slate-50'}`}>
                   <div>
                     <p className={`text-sm font-semibold ${n8nStatus === 'success' ? 'text-indigo-700' : 'text-slate-700'}`}>
                       n8n Automation Pipeline
                     </p>
                     <p className="text-xs text-indigo-600/80">Revocation webhook sent to ecosystem partners.</p>
                   </div>
                   {n8nStatus === 'pending' ? (
                     <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></span>
                   ) : (
                     <span className="text-indigo-600 font-bold text-xs">SUCCESS</span>
                   )}
                 </div>
               )}
             </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:w-auto"
            >
              {status === 'success' ? 'Close' : 'Cancel'}
            </button>
            {status !== 'success' && (
              <button
                type="button"
                onClick={onConfirm}
                disabled={confirmDisabled}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300 sm:w-auto"
              >
                {status === 'pending' ? 'Signing...' : 'Yes, Revoke Token'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
