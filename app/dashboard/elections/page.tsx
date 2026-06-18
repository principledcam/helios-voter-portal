"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ElectionsPage() {
const router = useRouter();
const [elections, setElections] = useState<any[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
const load = async () => {
setLoading(true);

  const { data, error } = await supabase
    .from("elections")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error.message);
  }

  setElections(data || []);
  setLoading(false);
};

load();

}, []);

return ( <div style={styles.container}> <h1 style={styles.title}>Elections</h1>

  {loading && <p>Loading...</p>}

  {!loading && elections.length === 0 && (
    <p>No elections found.</p>
  )}

  {elections.map((e) => (
    <div
      key={e.id}
      style={styles.card}
      onClick={() =>
        router.push(`/dashboard/elections/${e.id}`)
      }
    >
      <h3>{e.title}</h3>

      <p style={styles.meta}>
        {e.description || "No description"}
      </p>

      <div style={styles.id}>
        ID: {e.id}
      </div>
    </div>
  ))}
</div>

);
}

const styles: Record<string, React.CSSProperties> = {
container: {
maxWidth: 800,
},
title: {
fontSize: 26,
marginBottom: 20,
},
card: {
padding: 16,
border: "1px solid #eee",
borderRadius: 10,
background: "#fff",
marginBottom: 12,
cursor: "pointer",
},
meta: {
fontSize: 13,
color: "#666",
marginTop: 4,
},
id: {
fontSize: 11,
color: "#aaa",
marginTop: 8,
},
};
