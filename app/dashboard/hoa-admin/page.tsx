"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function HOAAdminPortal() {
  const [users, setUsers] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [associations, setAssociations] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const { data: assoc } = await supabase.from("associations").select("*");
    setAssociations(assoc || []);

    const { data: members } = await supabase
      .from("association_members")
      .select("*");

    setMembers(members || []);
  };

  const approveUser = async (user_id: string, association_id: string) => {
    await supabase.from("association_members").insert({
      user_id,
      association_id,
      role: "member",
    });

    await load();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🏛️ HOA Admin Portal</h1>

      <h3>Associations</h3>
      {associations.map((a) => (
        <div key={a.id}>
          <strong>{a.name}</strong> — {a.status}
        </div>
      ))}

      <h3 style={{ marginTop: 20 }}>Pending Users (Mock View)</h3>

      <p>
        (Next step: connect signup table or Supabase Auth logs)
      </p>
    </div>
  );
}