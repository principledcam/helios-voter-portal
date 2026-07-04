import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

// 🧱 NEW DASHBOARD SYSTEM
import {
  PageHeader,
  Section,
  Card,
} from "@/app/components/ui";

export default async function Dashboard() {
  const supabase = await createSupabaseServerClient();

  // =========================
  // AUTH CHECK
  // =========================
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // =========================
  // PROFILE FETCH
  // =========================
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, email")
    .eq("id", user.id)
    .single();

  const role = profile?.role || "member";
return (
  <>
         {/* =========================
          PAGE HEADER (NEW SYSTEM)
      ========================= */}
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your account, role, and system access"
      />

      {/* =========================
          USER INFO SECTION
      ========================= */}
      <Section title="Account Information">
        <Card>
          <p>
            <strong>Welcome:</strong> {profile?.email}
          </p>

          <p>
            <strong>Role:</strong> {role}
          </p>
        </Card>
      </Section>

      {/* =========================
          ROLE-BASED SECTIONS
      ========================= */}

      {role === "admin" && (
        <Section title="Admin Panel">
          <Card style={styles.adminBox}>
            <h3>Full System Access</h3>
            <p>You have full administrative privileges across Helios.</p>
          </Card>
        </Section>
      )}

      {role === "board" && (
        <Section title="Board Access">
          <Card style={styles.boardBox}>
            <h3>Management Controls</h3>
            <p>Board-level access enabled for governance and oversight.</p>
          </Card>
        </Section>
      )}

      {role === "member" && (
        <Section title="Member Area">
          <Card style={styles.memberBox}>
            <h3>Standard Access</h3>
            <p>Member-level access for viewing and participation only.</p>
          </Card>
        </Section>
      )}
  </>
);
}

// =========================
// STYLES (MINIMAL OVERRIDES ONLY)
// =========================

const styles: Record<string, React.CSSProperties> = {
  adminBox: {
    background: "#ffecec",
    border: "1px solid #f5c2c2",
    borderRadius: 8,
  },

  boardBox: {
    background: "#eef6ff",
    border: "1px solid #cfe4ff",
    borderRadius: 8,
  },

  memberBox: {
    background: "#f5f5f5",
    border: "1px solid #e5e5e5",
    borderRadius: 8,
  },
};