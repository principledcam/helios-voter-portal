"use client";

import { useHoaQuery } from "@/app/hooks/useHoaQuery";
import { useHoa } from "@/app/context/HoaContext";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { logAudit } from "@/lib/audit/logAudit";

// 🧱 UI SYSTEM
import {
  PageHeader,
  Section,
  Card,
  Spinner,
} from "@/app/components/ui";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MembersPage() {
  const { activeHoa } = useHoa();

  const {
    data: members,
    loading,
    error,
    refetch,
  } = useHoaQuery("association_members");

  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data?.user) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      setProfile(profileData);
    };

    loadProfile();
  }, []);

  const canPromoteToAdmin =
    profile?.is_system_admin === true;

  async function updateRole(
    id: string,
    newRole: string
  ) {
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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    try {
      await logAudit({
        supabase,
        action: "role_updated",
        user_id: existingMember.user_id,
        association_id:
          existingMember.association_id,
        entity_type: "association_member",
        entity_id: id,
        performed_by: user?.id,
        performed_by_name: user?.email,
        before_state: {
          role: oldRole,
        },
        after_state: {
          role: newRole,
        },
        metadata: {
          updated_by: user?.id,
          updated_by_name: user?.email,
        },
      });
    } catch (err: any) {
      console.error(err);
    }

    await refetch();
  }

  async function removeMember(id: string) {
    const { error } = await supabase
      .from("association_members")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await refetch();
  }

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <>
        <Section title="Loading Members">
          <Spinner />
        </Section>
      </>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <>
        <Section title="Error">
          <Card>
            <p style={{ color: "red" }}>
              Error loading members.
            </p>
          </Card>
        </Section>
      </>
    );
  }

  // =========================
  // MAIN PAGE
  // =========================

  return (
    <>
      <PageHeader
        title="👥 Members"
        subtitle={`Manage members for ${
          activeHoa?.name ?? "Active HOA"
        }`}
      />

      <Section title="Association Members">
        {members.length === 0 ? (
          <Card>
            <p>
              No members found for the selected HOA.
            </p>
          </Card>
        ) : (
          members.map((m: any) => (
            <Card
              key={m.id}
              style={{ marginBottom: 12 }}
            >
              <p>
                <strong>User:</strong> {m.user_id}
              </p>

              <p>
                <strong>Role:</strong> {m.role}
              </p>

              <div style={styles.actions}>
                {canPromoteToAdmin && (
                  <button
                    onClick={() =>
                      updateRole(m.id, "admin")
                    }
                  >
                    Make Admin
                  </button>
                )}

                <button
                  onClick={() =>
                    updateRole(m.id, "member")
                  }
                >
                  Make Member
                </button>

                <button
                  onClick={() =>
                    removeMember(m.id)
                  }
                >
                  Remove
                </button>
              </div>
            </Card>
          ))
        )}
      </Section>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  actions: {
    display: "flex",
    gap: 10,
    marginTop: 12,
  },
};