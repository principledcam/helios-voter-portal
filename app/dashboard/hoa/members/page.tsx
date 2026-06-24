"use client";

import { useHoaQuery } from "@/app/hooks/useHoaQuery";
import { createBrowserClient } from "@supabase/ssr";
import { logAudit } from "@/lib/audit/logAudit";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MembersPage() {
  const {
    data: members,
    loading,
    error,
    refetch,
  } = useHoaQuery("association_members");

  const updateRole = async (id: string, newRole: string) => {
    const { data: existingMember } = await supabase
      .from("association_members")
      .select("*")
      .eq("id", id)
      .single();

    if (!existingMember) {
      alert("Member not found");
      return;
    }

    const oldRole = existingMember.role;

    const { error } = await supabase
      .from("association_members")
      .update({ role: newRole })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    const { data: authData } = await supabase.auth.getUser();
    const authUser = authData?.user;

    try {
      await logAudit({
        supabase,
        action: "role_updated",
        user_id: existingMember.user_id,
        association_id: existingMember.association_id,
        entity_type: "association_member",
        entity_id: id,

        performed_by: authUser?.id,
        performed_by_name: authUser?.email,

        before_state: {
          role: oldRole,
        },

        after_state: {
          role: newRole,
        },

        metadata: {
          updated_by: authUser?.id,
          updated_by_name: authUser?.email,
        },
      });
    } catch (err: any) {
      console.error("Audit log failed:", err.message);
    }

    await refetch();
  };

  const removeMember = async (id: string) => {
    const { error } = await supabase
      .from("association_members")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await refetch();
  };

  if (loading) {
    return (
      <div style={{ padding: 30 }}>
        Loading members...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: 30,
          color: "red",
        }}
      >
        Error loading members
      </div>
    );
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>👥 Members</h1>

      {members.length === 0 ? (
        <p>No members found for the selected HOA.</p>
      ) : (
        members.map((m: any) => (
          <div
            key={m.id}
            style={{
              border: "1px solid #eee",
              padding: 10,
              marginBottom: 10,
              borderRadius: 8,
              background: "#fff",
            }}
          >
            <p>
              <strong>User:</strong> {m.user_id}
            </p>

            <p>
              <strong>Role:</strong> {m.role}
            </p>

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 10,
              }}
            >
              <button
                onClick={() => updateRole(m.id, "admin")}
              >
                Make Admin
              </button>

              <button
                onClick={() => updateRole(m.id, "member")}
              >
                Make Member
              </button>

              <button
                onClick={() => removeMember(m.id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}