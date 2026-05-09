import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import DashboardPage from '../pages/DashboardPage';
import ShareProofPage from '../pages/ShareProofPage';
import BankSimulatorPage from '../pages/BankSimulatorPage';
import CompliancePage from '../pages/CompliancePage';
import ArchitecturePage from '../pages/ArchitecturePage';
import SuspiciousVerification from '../components/sponsors/SuspiciousVerification';
import FraudDashboard from '../components/sponsors/FraudDashboard';
import AgentMemory from '../components/sponsors/AgentMemory';
import MockDigiLocker from '../pages/MockDigiLocker';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/share" element={<ShareProofPage />} />
      <Route path="/bank-simulator" element={<BankSimulatorPage />} />
      <Route path="/compliance" element={<CompliancePage />} />
      <Route path="/architecture" element={<ArchitecturePage />} />
      <Route path="/sponsor/verification" element={<div className="min-h-screen bg-slate-50 pt-20"><SuspiciousVerification /></div>} />
      <Route path="/sponsor/fraud" element={<div className="min-h-screen bg-slate-50 pt-20"><FraudDashboard /></div>} />
      <Route path="/sponsor/memory" element={<div className="min-h-screen bg-slate-50 pt-20"><AgentMemory /></div>} />
      <Route path="/digilocker-gate" element={<MockDigiLocker />} />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}
