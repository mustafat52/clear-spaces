import React, { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import { supabase } from "../lib/supabase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  }

  return (
    <div className="cs-auth-wrap">
      <div className="cs-auth-card">
        <Link to="/" style={{ display: "flex", justifyContent: "center", marginBottom: 18, textDecoration: "none" }}>
          <Logo size={52} />
        </Link>
        <h1 className="cs-auth-title">Reset your password</h1>
        <p className="cs-auth-sub">
          {sent
            ? "If that email has an account, a reset link is on its way. Open it to set a new password."
            : "Enter the email you signed up with — we'll send a link to reset your password."}
        </p>

        {error && <div className="cs-error-box">{error}</div>}

        {!sent && (
          <form onSubmit={handleSubmit}>
            <div className="cs-field">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
            </div>
            <button className="cs-btn cs-btn-amber cs-btn-full" type="submit" disabled={busy}>
              {busy ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}

        <Link to="/login" className="cs-auth-back">
          ← Back to log in
        </Link>
      </div>
    </div>
  );
}