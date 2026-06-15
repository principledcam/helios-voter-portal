import { createSupabaseServerClient } from "../../lib/supabaseServer";
import { redirect } from "next/navigation";
import SidebarLayout from "../../components/SidebarLayout";
import RoleEditor from "../../components/RoleEditor";

export default async function AdminPage() {
  const supabase = createSupabaseServerClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: users } = await supabase
    .from("profiles")
    .select("id, email, role, created_at")
    .order("created_at", { ascending: false });

  return (
    <SidebarLayout>
      <div style={{ padding: 20 }}>
        <h1>Admin User Management</h1>
        <p>Manage user roles in real time</p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr",
            fontWeight: "bold",
            marginTop: 20,
            paddingBottom: 10,
            borderBottom: "1px solid #eee",
          }}
        >
          <span>Email</span>
          <span>Role</span>
          <span>Action</span>
        </div>

        {users?.map((u) => (
          <RoleEditor key={u.id} user={u} />
        ))}
      </div>
    </SidebarLayout>
  );
}