import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import UnauthorizedPage from './pages/auth/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';

// Role-based Dashboards
import StudentDashboard from './pages/student/StudentDashboard';
import CreateReportPage from './pages/student/CreateReportPage';
import MyReportsPage from './pages/student/MyReportsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminStaffPage from './pages/admin/AdminStaffPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import CampusMapPage from './pages/admin/CampusMapPage';
import StaffDashboard from './pages/staff/StaffDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          
          <main style={{ flex: 1 }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/campus-map" element={<CampusMapPage />} />
              <Route path="/map" element={<CampusMapPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              {/* Student Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']} />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/report" element={<CreateReportPage />} />
                <Route path="/student/my-reports" element={<MyReportsPage />} />
              </Route>

              {/* Admin Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/map" element={<CampusMapPage />} />
                <Route path="/admin/reports" element={<AdminReportsPage />} />
                <Route path="/admin/staff" element={<AdminStaffPage />} />
                <Route path="/admin/analytics" element={<AnalyticsPage />} />
              </Route>

              {/* Cleaning Staff Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['STAFF', 'ADMIN']} />}>
                <Route path="/staff/dashboard" element={<StaffDashboard />} />
                {/* Placeholders for upcoming pages */}
                <Route path="/staff/history" element={<StaffDashboard />} />
              </Route>

              {/* Fallback 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
