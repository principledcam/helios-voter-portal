import crypto from "crypto";

export function hashVoterReference(userId: string, electionId: string) {
  return crypto
    .createHash("sha256")
    .update(`${userId}:${electionId}:florida-718-128`)
    .digest("hex");
}

export function createVoteReceipt({
  electionId,
  ballotId,
  optionId,
  voterHash,
}: {
  electionId: string;
  ballotId: string;
  optionId: string;
  voterHash: string;
}) {
  const payload = `${electionId}:${ballotId}:${optionId}:${voterHash}`;
  return crypto.createHash("sha256").update(payload).digest("hex");
}

export function createBallotChoiceHash(optionId: string, ballotId: string) {
  return crypto
    .createHash("sha256")
    .update(`${ballotId}:${optionId}:ballot-choice`)
    .digest("hex");
}
