import { Invite } from "./types";
import {
  canAcceptInvite,
  getInviteStatus,
} from "./inviteValidation";

export function buildInviteViewModel(invite: Invite) {
  return {
    ...invite,
    status: getInviteStatus(invite),
    canAccept: canAcceptInvite(invite),
  };
}