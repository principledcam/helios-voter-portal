"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { logAudit } from "@/lib/audit/logAudit";

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

const updateRole = async (id: string, newRole: string) => {
// Get current member first
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

// Write audit record
try {
  await logAudit({
    supabase,
    action: "role_updated",
    user_id: existingMember.user_id,
    association_id: existingMember.association_id,
    entity_type: "association_member",
    entity_id: id,

    before_state: {
      role: oldRole,
    },

    after_state: {
      role: newRole,
    },
  });
} catch (err: any) {
  console.error("Audit log failed:", err.message);
}

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
<div style={{ padding: 30 }}> <h1>👥 Members</h1>

  {members.map((m) => (
    <div
      key={m.id}
      style={{
        border: "1px solid #eee",
        padding: 10,
        marginBottom: 10,
      }}
    >
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
