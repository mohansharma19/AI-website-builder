
import React from "react";
import { Route, Routes } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import RegisterPages from "./pages/RegisterPages";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import CommunityPage from "./pages/CommunityPage";
import PricingPage from "./pages/PricingPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import SettingsPage from "./pages/SettingsPage";
import ScrollToTop from "./components/ScrollToTop";
import { Toaster } from "react-hot-toast";
import BuilderPage from "./pages/BuilderPage";
import PreviewPage from "./pages/PreviewPage";

const App = () => {
  return (
    <>
      <ScrollToTop />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: "10px",
            fontSize: "14px",
          },
          success: {
            style: {
              background: "#10b981",
              color: "#fff",
            },
          },
          error: {
            style: {
              background: "#ef4444",
              color: "#fff",
            },
          },
        }}
      />

      <Routes>
        {/* Landing */}
        <Route path="/" element={<LandingPage />} />

        {/* Authentication */}
        <Route path="/register" element={<RegisterPages />} />

        <Route path="/verify-email" element={<VerifyEmailPage />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/forgot" element={<ForgotPasswordPage />} />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Builder */}
        <Route
          path="/projects/:id"
          element={
            <ProtectedRoute>
              <BuilderPage />
            </ProtectedRoute>
          }
        />

        {/* Community */}
        <Route
          path="/community"
          element={<CommunityPage />}
        />

        {/* Public Project Preview */}
        <Route
          path="/preview/:id"
          element={<PreviewPage />}
        />

        {/* Pricing */}
        <Route
          path="/pricing"
          element={<PricingPage />}
        />

        {/* Settings */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;
