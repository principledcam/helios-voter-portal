function toHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hashText(value: string) {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(value)
    );
    return toHex(new Uint8Array(digest));
  }

  // Safari / older environments fallback
  return toHex(
    new Uint8Array(
      await import("crypto").then((mod) =>
        mod.createHash("sha256").update(value).digest()
      )
    )
  );
}

export async function hashVoterReference(userId: string, electionId: string) {
  return hashText(`${userId}:${electionId}:florida-718-128`);
}

export async function createVoteReceipt({
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
  return hashText(`${electionId}:${ballotId}:${optionId}:${voterHash}`);
}

export async function createBallotChoiceHash(optionId: string, ballotId: string) {
  return hashText(`${ballotId}:${optionId}:ballot-choice`);
}
