export function validateDashboardPage(children: any) {
  if (!children) {
    throw new Error("Dashboard page missing layout wrapper");
  }
}