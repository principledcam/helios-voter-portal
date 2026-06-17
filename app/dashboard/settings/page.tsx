import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default async function SettingsPage() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, email, created_at")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  return (
    <SidebarLayout>
      <div style={styles.card}>
        <h1>Settings</h1>
        <p>Account & system preferences</p>

        <div style={styles.section}>
          <h3>Account Info</h3>
          <p><b>Email:</b> {profile.email}</p>
          <p><b>Role:</b> {profile.role}</p>
          <p><b>Member Since:</b> {new Date(profile.created_at).toLocaleDateString()}</p>
        </div>

        <div style={styles.section}>
          <h3>System Settings</h3>
          <p style={{ opacity: 0.6 }}>
            Settings panel is ready for expansion (notifications, security, preferences).
          </p>
        </div>
      </div>
    </SidebarLayout>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: "#fff",
    padding: 30,
    borderRadius: 12,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },

  section: {
    marginTop: 20,
    paddingTop: 20,
    borderTop: "1px solid #eee",
  },
};