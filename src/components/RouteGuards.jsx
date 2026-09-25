import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";

export function RequirePatient({ children }) {
  const { session, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullPageLoader />;
  if (!session) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

export function RequireStaff({ children }) {
  const { session, profile, loading, isStaff } = useAuth();
  const location = useLocation();
  if (loading) return <FullPageLoader />;
  if (!session) return <Navigate to="/staff/login" state={{ from: location }} replace />;
  if (!isStaff) return <Navigate to="/staff/login" state={{ notStaff: true }} replace />;
  return children;
}

export function FullPageLoader() {
  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
      Loading…
    </div>
  );
}