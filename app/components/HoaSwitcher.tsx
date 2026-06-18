"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function HoaSwitcher() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [associations, setAssociations] = useState<any[]>([]);
  const [activeHoa, setActiveHoa] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, is_system_admin")
        .eq("id", user.id)
        .single();

      const admin =
        profile?.role === "admin" || profile?.is_system_admin === true;

      setIsAdmin(admin);

      if (admin) {
        const { data: hoas, error } = await supabase
  .from("associations")
  .select("*");

console.log("HOAS:", hoas);
console.log("HOA ERROR:", error);

        setAssociations(hoas || []);
        setActiveHoa(hoas?.[0] || null);
      }

      setLoading(false);
    };

    load();
  }, []);

  if (loading) {
    return <div style={styles.loading}>Loading HOA...</div>;
  }

  if (!isAdmin) return null;

  return (
    <div style={styles.wrapper}>
      <div style={styles.header} onClick={() => setOpen(!open)}>
        🏛️ HOA: {activeHoa?.name || "Select HOA"} ⌄
      </div>

      {open && (
        <div style={styles.dropdown}>
          {associations.map((hoa) => (
            <div
              key={hoa.id}
              style={styles.item}
              onClick={() => {
                setActiveHoa(hoa);
                setOpen(false);
              }}
            >
              {hoa.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    marginBottom: 10,
    position: "relative",
  },

  header: {
    background: "#1e7f3e",
    color: "white",
    padding: "10px",
    fontWeight: "bold",
    borderRadius: 6,
    cursor: "pointer",
  },

  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    background: "white",
    border: "1px solid #ddd",
    borderRadius: 6,
    zIndex: 999,
  },

  item: {
    padding: 10,
    cursor: "pointer",
    borderBottom: "1px solid #eee",
  },

  loading: {
    background: "#333",
    color: "white",
    padding: 8,
    fontSize: 12,
  },
};