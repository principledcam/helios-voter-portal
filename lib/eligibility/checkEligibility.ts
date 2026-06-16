export async function checkEligibility({
  supabase,
  user_id,
  association_id,
}: {
  supabase: any;
  user_id: string;
  association_id: string;
}) {
  // 1. Check if association is active
  const { data: association } = await supabase
    .from("associations")
    .select("id, status, contract_signed")
    .eq("id", association_id)
    .single();

  if (!association) {
    return { allowed: false, reason: "Association not found" };
  }

  if (association.status !== "active") {
    return { allowed: false, reason: "Association not active" };
  }

  if (!association.contract_signed) {
    return { allowed: false, reason: "Contract not executed" };
  }

  // 2. Check membership
  const { data: membership } = await supabase
    .from("association_members")
    .select("*")
    .eq("user_id", user_id)
    .eq("association_id", association_id)
    .single();

  if (!membership) {
    return { allowed: false, reason: "Not an approved member" };
  }

  return { allowed: true, reason: "Approved" };
}