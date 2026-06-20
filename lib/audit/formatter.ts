export function formatAudit(log: any) {
  const actor =
    log.actor_name ||
    log.metadata?.user_name ||
    "Unknown User";

  switch (log.action) {
    case "role_updated": {
      const before = log.before_state?.role ?? "unknown";
      const after = log.after_state?.role ?? "unknown";

      return `${actor} changed role from ${before} → ${after}`;
    }

    case "election_created":
      return `${actor} created election "${log.after_state?.title || "Untitled"}"`;

    case "vote_cast":
      return `${actor} cast a vote in election ${log.entity_id}`;

    default:
      return `${actor} performed ${log.action}`;
  }
}