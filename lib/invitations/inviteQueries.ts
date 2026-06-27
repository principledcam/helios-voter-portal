import { SupabaseClient } from "@supabase/supabase-js";

export async function getInviteByCode(
  supabase: SupabaseClient,
  code: string
) {
  return supabase
    .from("association_invites")
    .select("*")
    .eq("invite_code", code)
    .single();
}

export async function getInvitesForAssociation(
  supabase: SupabaseClient,
  associationId: string
) {
  return supabase
    .from("association_invites")
    .select("*")
    .eq("association_id", associationId)
    .order("created_at", { ascending: false });
}