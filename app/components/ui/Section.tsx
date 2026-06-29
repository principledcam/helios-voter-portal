import { theme } from "@/app/styles/theme";

export default function Section({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: theme.spacing(6) }}>
      {title && (
        <h2 style={{ marginBottom: theme.spacing(3) }}>
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}