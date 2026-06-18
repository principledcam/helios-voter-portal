"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useHoa } from "@/app/context/HoaContext";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function HoaSwitcher() {
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [associations, setAssociations] = useState<any[]>([]);

  // ✅ GLOBAL HOA STATE (NEW)
  const { activeHoa, setActiveHoa } = useHoa();

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

      const isHoaAdmin = profile?.role === "hoa_admin";
      const isMember = profile?.role === "member";

      let query = supabase
        .from("association_members")
        .select(`
          association_id,
          associations:association_id (
            id,
            name
          )
        `)
        .eq("user_id", user.id);

      // role-based filtering
      if (isHoaAdmin || isMember) {
        query = query.eq("role", profile?.role);
      }

      const { data, error } = await query;

      console.log("HOA SWITCHER DATA:", data);
      console.log("HOA SWITCHER ERROR:", error);

      const formatted =
        data?.map((m: any) => m.associations).filter(Boolean) || [];

      setAssociations(formatted);

      // ✅ ONLY SET DEFAULT IF NONE SELECTED GLOBALLY
      if (!activeHoa && formatted.length > 0) {
        setActiveHoa(formatted[0]);
      }

      setLoading(false);
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <div style={styles.loading}>Loading HOA...</div>;
  }

  if (associations.length === 0) return null;

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
                setActiveHoa(hoa); // ✅ GLOBAL UPDATE
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
    background: "#28A8A8",
    color: "#ffffff",
    padding: "10px",
    fontWeight: "bold",
    borderRadius: 6,
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    background: "#ffffff",
    border: "1px solid rgba(40,168,168,0.25)",
    borderRadius: 6,
    zIndex: 999,
    overflow: "hidden",
  },

  item: {
    padding: 10,
    cursor: "pointer",
    borderBottom: "1px solid #eee",
    color: "#28A8A8",
    fontWeight: 500,
  },

  loading: {
    background: "#333",
    color: "white",
    padding: 8,
    fontSize: 12,
  },
};