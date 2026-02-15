import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout.jsx";

import AdminLogin from "./pages/AdminLogin.jsx";
import BlogSpeedsLanding from "./pages/Cover.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import BlogEditor from "./pages/BlogEditor.jsx";
import NotFound from "./pages/NotFound.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AnalyticsDashboard from "./pages/Analytics.jsx";
import SubscribersPage from "./pages/Subscribers.jsx";
import PricingPage from "./pages/PricingPage.jsx";
import UserLogin from "./pages/UserLogin.jsx";
import UserRegister from "./pages/UserRegister.jsx";
import TermsConditions from "./pages/TermsConditions.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import { UserProvider } from "./context/UserContext.jsx";
import { AdminProvider } from "./context/AdminContext.jsx";

export default function App() {
  return (
    <AdminProvider>
      <UserProvider>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/" element={<BlogSpeedsLanding />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/login" element={<UserLogin />} />
          <Route path="/register" element={<UserRegister />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="new" element={<BlogEditor />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />
            <Route path="edit/:id" element={<BlogEditor />} />
            <Route path="subscribers" element={<SubscribersPage />} />
            <Route path="pricing" element={<PricingPage />} />
          </Route>

          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </UserProvider>
    </AdminProvider>
  );
}
