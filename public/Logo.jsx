import React from "react";

export default function Logo({ size = 38, alt = "Clearspaces" }) {
  return <img src="/logo.png" alt={alt} width={size} height={size} style={{ borderRadius: "50%" }} />;
}