import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import { supabaseConfigured } from "./lib/supabase";
import SetupNeeded from "./components/SetupNeeded";
import { RequirePatient, RequireStaff } from "./components/RouteGuards";

import Landing from "./pages/Landing";
import PatientLogin from "./pages/PatientLogin";
import PatientDashboard from "./pages/PatientDashboard";
import StaffLogin from "./pages/StaffLogin";
import StaffDashboard from "./pages/StaffDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

export default function App() {
  if (!supabaseConfigured) {
    return <SetupNeeded />;
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<PatientLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/dashboard"
            element={
              <RequirePatient>
                <PatientDashboard />
              </RequirePatient>
            }
          />
          <Route path="/manager/login" element={<StaffLogin />} />
          <Route
            path="/staff"
            element={
              <RequireStaff>
                <StaffDashboard />
              </RequireStaff>
            }
          />
          <Route path="*" element={<Landing />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}