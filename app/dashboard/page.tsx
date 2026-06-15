import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import SidebarLayout from "../components/SidebarLayout";

export default async function Dashboard() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, email")
    .eq("id", user.id)
    .single();

  const role = profile?.role || "member";

  return (
    <SidebarLayout>
      <div style={styles.card}>
        <h1>Dashboard</h1>

        <p>
          Welcome: <strong>{profile?.email}</strong>
        </p>

        <p>
          Role: <strong>{role}</strong>
        </p>

        {role === "admin" && (
          <div style={styles.adminBox}>
            <h3>Admin Panel</h3>
            <p>You have full system access.</p>
          </div>
        )}

        {role === "board" && (
          <div style={styles.boardBox}>
            <h3>Board Access</h3>
            <p>Management-level access enabled.</p>
          </div>
        )}

        {role === "member" && (
          <div style={styles.memberBox}>
            <h3>Member Area</h3>
            <p>Standard access only.</p>
          </div>
        )}
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
  adminBox: {
    marginTop: 20,
    padding: 15,
    background: "#ffecec",
  },
  boardBox: {
    marginTop: 20,
    padding: 15,
    background: "#eef6ff",
  },
  memberBox: {
    marginTop: 20,
    padding: 15,
    background: "#f5f5f5",
  },
};
