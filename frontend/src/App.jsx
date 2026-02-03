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

export default function App() {
  return (
    <Routes>
      

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/" element={<BlogSpeedsLanding />} />

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
      </Route>


      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
