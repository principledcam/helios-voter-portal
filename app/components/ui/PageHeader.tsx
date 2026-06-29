import { theme } from "@/app/styles/theme";

export default function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h1 style={{ margin: 0 }}>{title}</h1>

      {subtitle && (
        <p style={{ color: theme.colors.muted }}>
          {subtitle}
        </p>
      )}

      {action && <div style={{ marginTop: 10 }}>{action}</div>}
    </div>
  );
}