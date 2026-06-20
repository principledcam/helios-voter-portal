export function formatAudit(log: any) {
  switch (log.action) {
    case "role_updated": {
      const before = log.before_state?.role;
      const after = log.after_state?.role;

      // 🧠 SAFE FALLBACK (prevents undefined → undefined issue)
      if (!before && !after) {
        return "User changed role (no captured state)";
      }

      return `User changed role from ${before ?? "unknown"} → ${after ?? "unknown"}`;
    }

    case "election_created": {
      return `Election "${log.after_state?.title ?? "Untitled"}" was created`;
    }

    case "election_updated": {
      return `Election "${log.after_state?.title ?? "Untitled"}" was updated`;
    }

    case "election_published": {
      return `Election "${log.after_state?.title ?? "Untitled"}" was published`;
    }

    case "vote_cast": {
      return `Vote cast in election ${log.entity_id ?? "unknown"}`;
    }

    case "member_added": {
      return `Member added to association`;
    }

    case "member_removed": {
      return `Member removed from association`;
    }

    default:
      return log.action || "Unknown audit event";
  }
}