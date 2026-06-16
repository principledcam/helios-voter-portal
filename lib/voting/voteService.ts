export async function submitVote({
  supabase,
  user_id,
  election_id,
  ballot_id,
  option_id,
}: {
  supabase: any;
  user_id: string;
  election_id: string;
  ballot_id: string;
  option_id: string;
}) {
  const { data: election, error: electionError } = await supabase
    .from("elections")
    .select("status, settings")
    .eq("id", election_id)
    .single();

  if (electionError || !election) {
    throw new Error("Election not found");
  }

  if (election.status !== "published") {
    throw new Error("Election is not active");
  }

  const { data: ballot, error: ballotError } = await supabase
    .from("ballots")
    .select("id")
    .eq("id", ballot_id)
    .eq("election_id", election_id)
    .single();

  if (ballotError || !ballot) {
    throw new Error("Invalid ballot");
  }

  const { data: option, error: optionError } = await supabase
    .from("ballot_options")
    .select("id")
    .eq("id", option_id)
    .eq("ballot_id", ballot_id)
    .single();

  if (optionError || !option) {
    throw new Error("Invalid option");
  }

  const { data: existing } = await supabase
    .from("votes")
    .select("id")
    .eq("election_id", election_id)
    .eq("user_id", user_id)
    .maybeSingle();

  if (existing && !election.settings?.allow_multiple_votes) {
    throw new Error("You have already voted in this election");
  }

  const { data: vote, error: insertError } = await supabase
    .from("votes")
    .insert({
      election_id,
      ballot_id,
      option_id,
      user_id,
    })
    .select()
    .single();

  if (insertError) {
    throw insertError;
  }

  await supabase.from("vote_audit_log").insert({
    vote_id: vote.id,
    action: "INSERT",
    metadata: {
      election_id,
      ballot_id,
      option_id,
      user_id,
      timestamp: new Date().toISOString(),
    },
  });

  return vote;
}