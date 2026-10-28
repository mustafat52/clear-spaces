import React from "react";

// Icon-only mark (brain + heart + rising sun) on its own white tile.
// The full lockup with the wordmark lives at /logo-full.png.
export default function Logo({ size = 38, alt = "Clearspaces" }) {
  return (
    <img
      src="/logo-mark.png"
      alt={alt}
      width={size}
      height={size}
      style={{ borderRadius: 12, background: "#fff", boxShadow: "0 0 0 1px rgba(12,43,89,0.10)" }}
    />
  );
}