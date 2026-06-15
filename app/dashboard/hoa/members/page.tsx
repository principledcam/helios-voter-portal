"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MembersPage() {
  const [members, setMembers] = useState<any[]>([]);

  const load = async () => {
    const { data } = await supabase
      .from("association_members")
      .select("*")
      .order("created_at", { ascending: false });

    setMembers(data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const updateRole = async (id: string, role: string) => {
    await supabase
      .from("association_members")
      .update({ role })
      .eq("id", id);

    load();
  };

  const removeMember = async (id: string) => {
    await supabase
      .from("association_members")
      .delete()
      .eq("id", id);

    load();
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>👥 Members</h1>

      {members.map((m) => (
        <div key={m.id} style={{ border: "1px solid #eee", padding: 10, marginBottom: 10 }}>
          <p>User: {m.user_id}</p>
          <p>Role: {m.role}</p>

          <button onClick={() => updateRole(m.id, "admin")}>
            Make Admin
          </button>

          <button onClick={() => updateRole(m.id, "member")}>
            Make Member
          </button>

          <button onClick={() => removeMember(m.id)}>
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
