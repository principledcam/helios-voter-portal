"use client";

import { theme } from "@/app/styles/theme";

export default function Button({
  children,
  variant = "primary",
  onClick,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  onClick?: () => void;
}) {
  const colors = {
    primary: theme.colors.primary,
    secondary: theme.colors.muted,
    danger: theme.colors.danger,
  };

  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 14px",
        borderRadius: theme.radius.sm,
        border: "none",
        cursor: "pointer",
        color: "#fff",
        background: colors[variant],
      }}
    >
      {children}
    </button>
  );
}