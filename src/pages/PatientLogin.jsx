import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { useAuth } from "../lib/auth";

export default function PatientLogin() {
  const { signIn, signUpPatient } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const [mode, setMode] = useState("signin"); // 'signin' | 'signup'
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);
    try {
      if (mode === "signup") {
        if (!form.fullName.trim() || !form.phone.trim() || !form.email.trim() || form.password.length < 6) {
          setError("Please fill every field. Password needs at least 6 characters.");
          setBusy(false);
          return;
        }
        const { data: signUpData, error: signUpError } = await signUpPatient({
          email: form.email.trim(),
          password: form.password,
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
        });
        if (signUpError) {
          setError(signUpError.message);
        } else if (!signUpData?.session) {
          // Email confirmation is required — no session yet, so there's
          // nothing to route to. Tell the user instead of silently
          // bouncing them to the login form.
          setInfo("Account created! Check your inbox for a confirmation email, then log in below.");
          setMode("signin");
          setForm((f) => ({ ...f, password: "" }));
        } else {
          navigate(from, { replace: true });
        }
      } else {
        const { error: signInError } = await signIn({ email: form.email.trim(), password: form.password });
        if (signInError) {
          setError(signInError.message);
        } else {
          navigate(from, { replace: true });
        }
      }
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
        <h1 className="cs-auth-title">{mode === "signin" ? "Log in to ClearSpaces" : "Create your account"}</h1>
        <p className="cs-auth-sub">
          {mode === "signin"
            ? "Log in to book a session or view your session history."
            : "Booking a session keeps your history in one place across visits."}
        </p>

        {error && <div className="cs-error-box">{error}</div>}
        {info && <div className="cs-note-box" style={{ marginBottom: 16 }}>{info}</div>}

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <>
              <div className="cs-field">
                <label>Full name</label>
                <input value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Your name" />
              </div>
              <div className="cs-field">
                <label>Phone</label>
                <input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91" />
              </div>
            </>
          )}
          <div className="cs-field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@email.com" />
          </div>
          <div className="cs-field">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
            />
          </div>
          <button className="cs-btn cs-btn-amber cs-btn-full" type="submit" disabled={busy}>
            {busy ? "Please wait…" : mode === "signin" ? "Log in" : "Create account"}
          </button>
        </form>

        <div className="cs-auth-switch">
          {mode === "signin" ? (
            <>
              New here?{" "}
              <button onClick={() => { setMode("signup"); setError(""); }}>Create an account</button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button onClick={() => { setMode("signin"); setError(""); }}>Log in</button>
            </>
          )}
        </div>

        <Link to="/" className="cs-auth-back">
          ← Back to site
        </Link>
      </div>
    </div>
  );
}