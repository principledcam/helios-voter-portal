export const theme = {
  colors: {
    primary: "#28A8A8",
    success: "#16A34A",
    warning: "#F59E0B",
    danger: "#DC2626",

    background: "#F8FAFC",
    card: "#FFFFFF",
    border: "#E5E7EB",
    text: "#111827",
    muted: "#6B7280",
  },

  radius: {
    sm: "6px",
    md: "10px",
    lg: "14px",
  },

  shadow: {
    sm: "0 2px 8px rgba(0,0,0,0.05)",
    md: "0 4px 12px rgba(0,0,0,0.08)",
  },

  spacing: (n: number) => `${n * 4}px`,
};