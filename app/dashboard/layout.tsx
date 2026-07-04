import RoleGuard from "@/app/components/RoleGuard";
import DashboardShell from "@/app/components/layout/DashboardShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard>
  <DashboardShell>
    {children}
  </DashboardShell>
</RoleGuard>
  );
}