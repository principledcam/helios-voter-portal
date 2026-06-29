"use client";

import { theme } from "@/app/styles/theme";

export default function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: theme.colors.card,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.md,
        boxShadow: theme.shadow.sm,
        padding: theme.spacing(4),
        ...style,
      }}
    >
      {children}
    </div>
  );
}