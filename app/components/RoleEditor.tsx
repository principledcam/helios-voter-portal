"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { logAudit } from "@/lib/audit/logAudit";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RoleEditor({ user, activeHoaId }: any) {
  const [role, setRole] = useState(user.role);
  const [loading, setLoading] = useState(false);

  const updateRole = async () => {
    setLoading(true);

    const nextRole = role;

    // 1. UPDATE ROLE IN DATABASE
    const { error } = await supabase
      .from("profiles")
      .update({ role: nextRole })
      .eq("id", user.id);

    if (error) {
      setLoading(false);
      alert("Error updating role: " + error.message);
      return;
    }

    // 2. FETCH SOURCE OF TRUTH (PREVENTS NULL AUDIT STATE)
    const { data: dbUser, error: fetchError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (fetchError) {
      console.error("Failed to fetch updated user:", fetchError.message);
    }

    // 3. GET AUTH USER
    const { data: userData } = await supabase.auth.getUser();
    const authUser = userData?.user;

    if (!authUser) {
      setLoading(false);
      alert("No authenticated user found");
      return;
    }

    // 4. WRITE AUDIT LOG (FINAL FIXED VERSION)
    await logAudit({
      supabase,
      action: "role_updated",
      user_id: user.id,
      association_id: activeHoaId,
      entity_type: "user",
      entity_id: user.id,

      before_state: {
        role: dbUser?.role ?? "unknown",
      },

      after_state: {
        role: nextRole,
      },

      metadata: {
        updated_by: authUser.id,
        source: "role_editor",
      },
    });

    setLoading(false);
    alert("Role updated successfully");
  };

  return (
    <div style={styles.row}>
      <span>{user.email}</span>

      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        style={styles.select}
      >
        <option value="member">member</option>
        <option value="board">board</option>
        <option value="admin">admin</option>
      </select>

      <button onClick={updateRole} disabled={loading} style={styles.button}>
        {loading ? "Saving..." : "Save"}
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  row: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr",
    padding: "10px 0",
    borderBottom: "1px solid #f2f2f2",
    alignItems: "center",
    fontSize: 14,
  },

  select: {
    padding: 6,
    borderRadius: 6,
    border: "1px solid #ddd",
  },

  button: {
    padding: "6px 10px",
    borderRadius: 6,
    border: "1px solid #ddd",
    cursor: "pointer",
    background: "#111",
    color: "#fff",
  },
};