import { theme } from "@/app/styles/theme";

export default function Badge({
  label,
  color = "primary",
}: {
  label: string;
  color?: "primary" | "success" | "warning" | "danger";
}) {
  return (
    <span
      style={{
        padding: "4px 8px",
        borderRadius: theme.radius.sm,
        fontSize: 12,
        background: theme.colors[color],
        color: "#fff",
      }}
    >
      {label}
    </span>
  );
}