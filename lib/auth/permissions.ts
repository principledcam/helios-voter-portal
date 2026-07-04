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
    .maybeSingle();

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
    .maybeSingle();

  return ["hoa_admin", "admin", "system_admin"].includes(
  data?.role
);
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
    .maybeSingle();

  return !!data;
}

export async function canManageHoa(associationId: string) {
  const result = await getCurrentUserProfile();

  if (!result) return false;

  // system admin override (always allowed)
  if (result.profile?.is_system_admin) return true;

  const { data } = await supabase
    .from("association_members")
    .select("role")
    .eq("user_id", result.user.id)
    .eq("association_id", associationId)
    .maybeSingle();

  if (!data) return false;

  const role = (data.role || "").toLowerCase();

  return (
    role === "hoa_admin" ||
    role === "admin" ||
    role === "owner"
  );
}