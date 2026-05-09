import { Link } from 'react-router-dom';

const differencePoints = [
  {
    title: 'No raw Aadhaar storage',
    text: 'We only store cryptographic proofs, not the actual Aadhaar XML data, eliminating the biggest breach risk.',
  },
  {
    title: 'Selective disclosure',
    text: 'Customers share only the information needed — age, state, gender — without exposing full identity.',
  },
  {
    title: 'Biometric binding',
    text: 'WebAuthn ties proof generation to a device, preventing mule accounts and stolen-phone fraud.',
  },
];

const steps = [
  {
    title: 'Upload Aadhaar XML',
    description: 'Simply upload your Aadhaar Offline XML. The app checks the UIDAI signature and keeps raw data on your device.',
  },
  {
    title: 'Bind biometrics',
    description: 'Use WebAuthn to securely bind your device. This ensures only you can generate proofs from this account.',
  },
  {
    title: 'Share proof',
    description: 'Generate a selective disclosure proof and share it via QR code. The bank verifies without seeing raw Aadhaar.',
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10 sm:px-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-10 shadow-card">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <img src="./hero-bg.svg" alt="Abstract government portal-style background" className="h-full w-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/90 to-slate-50/90" />
        </div>

        <div className="relative z-10 grid gap-10 lg:grid-cols-[1.35fr_0.95fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex rounded-full bg-brand-faint px-4 py-2 text-sm font-semibold text-brand">
              Zero-knowledge KYC built for India
            </span>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Privacy-preserving KYC powered by ZK + Algorand
            </h1>
            <p className="max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              Keep Aadhaar safe, reduce compliance risk, and onboard customers faster with a simple flow designed for everyday users.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-2xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-brand/20 transition hover:bg-brand-dark"
              >
                Launch PrivaKYC
              </Link>
              <Link
                to="/compliance"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Compliance dashboard
              </Link>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-8 shadow-card">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Impact snapshot</p>
              <p className="mt-5 text-3xl font-semibold text-slate-950">₹22,845 Cr</p>
              <p className="mt-3 text-slate-600">
                Projected fraud savings from privacy-safe KYC and fewer false positives in account onboarding.
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-8 shadow-card">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Citizen centered</p>
              <p className="mt-4 text-slate-700">
                Cousin lost ₹12 lakh in identity theft. PrivaKYC removes raw Aadhaar storage, so banks and citizens stay protected.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-10 shadow-card">
        <div className="mb-10 sm:flex sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Why PrivaKYC</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">How our solution is different</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            PrivaKYC is built for modern Indian KYC with privacy, device binding, and selective disclosure — not another raw Aadhaar repository.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {differencePoints.map((item) => (
            <div key={item.title} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-faint text-brand font-semibold">
                ✓
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-10 shadow-card">
        <div className="mb-10 sm:flex sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">How it works</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">A simple flow customers can trust</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            PrivaKYC transforms Aadhaar KYC into a customer-friendly experience without exposing raw identity data, making every step easy and transparent.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.title} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-faint text-brand font-semibold">
                ✓
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-950">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-14 rounded-[2rem] bg-brand px-6 py-10 text-white shadow-card sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-200">Contact</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Need help or want to partner?</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-100">
                Reach our team for product demos, integration questions, or compliance alignment with DPDP and PMLA guidelines.
              </p>
            </div>
            <div className="space-y-4 rounded-[1.5rem] border border-white/15 bg-white/10 p-6 text-sm text-white">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-200">Email</p>
                <p className="mt-2 text-base font-semibold">support@privakyc.example</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-200">Phone</p>
                <p className="mt-2 text-base font-semibold">+91 98765 43210</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-200">Office</p>
                <p className="mt-2 text-base font-semibold">Bengaluru, India</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
