import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import DashboardPage from '../pages/DashboardPage';
import ShareProofPage from '../pages/ShareProofPage';
import BankSimulatorPage from '../pages/BankSimulatorPage';
import CompliancePage from '../pages/CompliancePage';
import ArchitecturePage from '../pages/ArchitecturePage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/share" element={<ShareProofPage />} />
      <Route path="/bank-simulator" element={<BankSimulatorPage />} />
      <Route path="/compliance" element={<CompliancePage />} />
      <Route path="/architecture" element={<ArchitecturePage />} />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}
