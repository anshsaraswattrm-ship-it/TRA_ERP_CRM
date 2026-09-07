import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';

// Auth Pages
import Login from './pages/auth/Login';

// Dashboard
import Dashboard from './pages/dashboard/Dashboard';

// Admin Modules
import TargetSetup from './pages/admin/TargetSetup';
import UserAccounts from './pages/admin/UserAccounts';
import ITFaceRegistration from './pages/admin/ITFaceRegistration';
import ReceptionDesk from './pages/reception/ReceptionDesk'; // <-- Reception Desk Import

// HRM Modules
import LeaveCenter from './pages/hrm/LeaveCenter';
import Payroll from './pages/hrm/Payroll';
import Attendance from './pages/hrm/Attendance';
import EmployeeDocuments from './pages/hrm/EmployeeDocuments';

// CRM Modules
import StudentsPipeline from './pages/crm/StudentsPipeline';

//Sales Modules
import LeadsSales from './pages/sales/LeadsSales';

//Audit 
import AuditTrail from './pages/admin/AuditTrail';

function App() {
  return (
    <Router>
      <Routes>
        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected ERP Routes */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/targets" element={<TargetSetup />} />
          <Route path="/accounts" element={<UserAccounts />} />
          <Route path="/leaves" element={<LeaveCenter />} />
          <Route path="/payroll" element={<Payroll />} />
          <Route path="/documents" element={<EmployeeDocuments />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/students" element={<StudentsPipeline />} />
          <Route path="/leads" element={<LeadsSales />} />
          <Route path="/audit" element={<AuditTrail />} />
          <Route path="/admin/it-face-registration" element={<ITFaceRegistration />} />
          <Route path="/admin/reception-desk" element={<ReceptionDesk />} /> {/* <-- Reception Desk Route Added */}

          {/* Default Route handling inside Dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;