import { Invite } from "./types";

export function isInviteExpired(invite: Invite) {
  return new Date(invite.expires_at) < new Date();
}

export function getInviteStatus(invite: Invite) {
  if (invite.revoked) return "Revoked";

  if (invite.consumed) return "Accepted";

  if (isInviteExpired(invite)) return "Expired";

  return "Pending";
}

export function canAcceptInvite(invite: Invite) {
  return (
    !invite.revoked &&
    !invite.consumed &&
    !isInviteExpired(invite)
  );
}