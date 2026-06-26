import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getCurrentUserProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return {
    user,
    profile,
  };
}

export async function isSystemAdmin() {
  const result = await getCurrentUserProfile();

  return result?.profile?.is_system_admin === true;
}

export async function isHoaAdmin(
  associationId: string
) {
  const result = await getCurrentUserProfile();

  if (!result) return false;

  if (result.profile.is_system_admin) {
    return true;
  }

  const { data } = await supabase
    .from("association_members")
    .select("role")
    .eq("user_id", result.user.id)
    .eq("association_id", associationId)
    .single();

  return data?.role === "hoa_admin";
}

export async function isHoaMember(
  associationId: string
) {
  const result = await getCurrentUserProfile();

  if (!result) return false;

  const { data } = await supabase
    .from("association_members")
    .select("id")
    .eq("user_id", result.user.id)
    .eq("association_id", associationId)
    .single();

  return !!data;
}

export async function canManageHoa(
  associationId: string
) {
  return await isHoaAdmin(associationId);
}