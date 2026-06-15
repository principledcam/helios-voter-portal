"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AssociationsPage() {
  const [associations, setAssociations] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("associations")
        .select("*")
        .order("created_at", { ascending: false });

      setAssociations(data || []);
    };

    load();
  }, []);

  return (
    <div style={{ padding: 30 }}>
      <h1>🏘️ Associations</h1>

      {associations.map((a) => (
        <div key={a.id} style={{ border: "1px solid #eee", padding: 10, marginBottom: 10 }}>
          <h3>{a.name}</h3>
          <p>Status: {a.status}</p>
          <p>Contract Signed: {a.contract_signed ? "Yes" : "No"}</p>
        </div>
      ))}
    </div>
  );
}