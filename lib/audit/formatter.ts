export function formatAudit(log: any) {
  const beforeRole =
    log.before_state?.role ??
    log.metadata?.old_value ??
    null;

  const afterRole =
    log.after_state?.role ??
    log.metadata?.new_value ??
    null;

  // 🔥 CASE 1: fully broken legacy record
  if (!beforeRole && !afterRole) {
    return "User changed role (legacy record)";
  }

  // 🔥 CASE 2: partial legacy (very likely your Casa Verano issue)
  if (!beforeRole && afterRole) {
    return `User assigned role → ${afterRole}`;
  }

  if (beforeRole && !afterRole) {
    return `User removed role ${beforeRole}`;
  }

  // 🔥 NORMAL CASE
  return `User changed role from ${beforeRole} → ${afterRole}`;
}