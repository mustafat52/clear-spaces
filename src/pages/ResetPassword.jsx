import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { supabase } from "../lib/supabase";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase parses the recovery link's token from the URL and fires this
    // event once a temporary recovery session is established.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    // Fallback in case the event fired before this listener attached.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password needs at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Those two passwords don't match.");
      return;
    }
    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setDone(true);
    setTimeout(() => navigate("/login"), 2000);
  }

  return (
    <div className="cs-auth-wrap">
      <div className="cs-auth-card">
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <Logo size={52} />
        </div>
        <h1 className="cs-auth-title">Set a new password</h1>

        {!ready && !done && <p className="cs-auth-sub">Verifying your reset link…</p>}

        {ready && !done && (
          <>
            <p className="cs-auth-sub">Choose a new password for your account.</p>
            {error && <div className="cs-error-box">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="cs-field">
                <label>New password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                />
              </div>
              <div className="cs-field">
                <label>Confirm password</label>
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Type it again" />
              </div>
              <button className="cs-btn cs-btn-amber cs-btn-full" type="submit" disabled={busy}>
                {busy ? "Saving…" : "Save new password"}
              </button>
            </form>
          </>
        )}

        {done && <p className="cs-auth-sub">Password updated. Redirecting you to log in…</p>}
      </div>
    </div>
  );
}