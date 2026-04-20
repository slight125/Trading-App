import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import TradingPage from "./pages/TradingPage";

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Layout wrapper for authenticated routes
const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Layout>{children}</Layout>
);

// Main app routes
const AppRoutes: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Trading route (no layout wrapper) */}
      <Route path="/trade/:token" element={<TradingPage />} />

      {/* Public routes with layout */}
      <Route path="/login" element={!user ? <LayoutWrapper><LoginPage /></LayoutWrapper> : <Navigate to="/dashboard" replace />} />
      <Route path="/register" element={!user ? <LayoutWrapper><RegisterPage /></LayoutWrapper> : <Navigate to="/dashboard" replace />} />

      {/* Protected routes with layout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <LayoutWrapper>
              <DashboardPage />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

      {/* Redirect root to dashboard if logged in, otherwise to login */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
