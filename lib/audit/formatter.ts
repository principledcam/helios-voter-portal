export function formatAudit(log: any) {
  switch (log.action) {
    case "role_updated":
      return `${log.actor_name || "User"} changed role from ${log.before_state?.role} → ${log.after_state?.role}`;

    case "election_created":
      return `Election "${log.after_state?.title}" was created`;

    case "vote_cast":
      return `Vote cast in election ${log.entity_id}`;

    default:
      return log.action;
  }
}