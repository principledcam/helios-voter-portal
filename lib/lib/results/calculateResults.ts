export async function calculateResults({
  supabase,
  election_id,
}: {
  supabase: any;
  election_id: string;
}) {
  // ----------------------------
  // 1. Fetch election (optional but useful for validation)
  // ----------------------------
  const { data: election, error: electionError } = await supabase
    .from("elections")
    .select("id, status, title")
    .eq("id", election_id)
    .single();

  if (electionError || !election) {
    throw new Error("Election not found");
  }

  // ----------------------------
  // 2. Fetch all votes for election
  // ----------------------------
  const { data: votes, error: votesError } = await supabase
    .from("votes")
    .select("option_id")
    .eq("election_id", election_id);

  if (votesError) {
    throw votesError;
  }

  // ----------------------------
  // 3. Fetch ballot options (for labels)
  // ----------------------------
  const { data: options, error: optionsError } = await supabase
    .from("ballot_options")
    .select("id, label, ballot_id")
    .in(
      "id",
      (votes || []).map((v) => v.option_id)
    );

  if (optionsError) {
    throw optionsError;
  }

  // ----------------------------
  // 4. Build lookup map
  // ----------------------------
  const optionMap = new Map();

  for (const opt of options || []) {
    optionMap.set(opt.id, {
      label: opt.label,
      ballot_id: opt.ballot_id,
    });
  }

  // ----------------------------
  // 5. Aggregate results
  // ----------------------------
  const tally: Record<
    string,
    {
      option_id: string;
      label: string;
      ballot_id: string;
      count: number;
    }
  > = {};

  for (const vote of votes || []) {
    const opt = optionMap.get(vote.option_id);

    if (!opt) continue;

    if (!tally[vote.option_id]) {
      tally[vote.option_id] = {
        option_id: vote.option_id,
        label: opt.label,
        ballot_id: opt.ballot_id,
        count: 0,
      };
    }

    tally[vote.option_id].count += 1;
  }

  // ----------------------------
  // 6. Return structured results
  // ----------------------------
  return {
    election: {
      id: election.id,
      title: election.title,
      status: election.status,
    },
    results: Object.values(tally),
  };
}