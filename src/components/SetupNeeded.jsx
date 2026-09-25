import React from "react";
import Logo from "./Logo";

export default function SetupNeeded() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 480, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <Logo size={56} />
        </div>
        <h1 style={{ fontFamily: "Fraunces, serif", fontSize: 24, color: "var(--navy)", marginBottom: 12 }}>
          Supabase isn't connected yet
        </h1>
        <p style={{ color: "var(--text-muted)", lineHeight: 1.6, fontSize: 14.5 }}>
          This build needs a Supabase project. Add <code>VITE_SUPABASE_URL</code> and{" "}
          <code>VITE_SUPABASE_ANON_KEY</code> to your environment variables (locally in a{" "}
          <code>.env</code> file, or in your Vercel project settings), then redeploy. See{" "}
          <code>README.md</code> for the full setup, including the SQL schema to run.
        </p>
      </div>
    </div>
  );
}