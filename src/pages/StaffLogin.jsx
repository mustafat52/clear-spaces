import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";

export default function StaffLogin() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/staff";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(location.state?.notStaff ? "That account isn't set up as staff." : "");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { data, error: signInError } = await signIn({ email: email.trim(), password });
      if (signInError) {
        setError(signInError.message);
        setBusy(false);
        return;
      }
      const { data: profileRow } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();
      if (profileRow?.role !== "staff") {
        setError("That account isn't set up as staff. Contact the site admin.");
        await supabase.auth.signOut();
        setBusy(false);
        return;
      }
      navigate(from, { replace: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="cs-auth-wrap">
      <div className="cs-auth-card">
        <Link to="/" style={{ display: "flex", justifyContent: "center", marginBottom: 18, textDecoration: "none" }}>
          <Logo size={52} />
        </Link>
        <h1 className="cs-auth-title">Team login</h1>
        <p className="cs-auth-sub">For Munira's team — confirming sessions and managing the calendar.</p>

        {error && <div className="cs-error-box">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="cs-field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@clearspaces.com" />
          </div>
          <div className="cs-field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" />
          </div>
          <button className="cs-btn cs-btn-blue cs-btn-full" type="submit" disabled={busy}>
            {busy ? "Please wait…" : "Log in"}
          </button>
        </form>

        <Link to="/" className="cs-auth-back">
          ← Back to site
        </Link>
      </div>
    </div>
  );
}