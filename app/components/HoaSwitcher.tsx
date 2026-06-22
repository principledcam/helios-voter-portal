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

  // 🟢 GLOBAL HOA STATE
  const { activeHoa, setActiveHoa } = useHoa();

  useEffect(() => {
    const load = async () => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;

      if (!user) {
        setLoading(false);
        return;
      }

      // 🟢 GET USER PROFILE (ROLE CHECK ONLY)
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, is_system_admin")
        .eq("id", user.id)
        .single();

      // =========================
      // SYSTEM ADMIN — SEE ALL HOAS
      // =========================
      if (profile?.is_system_admin) {
        const { data } = await supabase
          .from("associations")
          .select("*")
          .order("name");

        setAssociations(data || []);

        if (!activeHoa && data && data.length > 0) {
          setActiveHoa(data[0]);
        }

        setLoading(false);
        return;
      }

      // =========================
      // HOA ADMIN / MEMBER — ONLY ASSIGNED HOA(S)
      // =========================
      const { data } = await supabase
        .from("association_members")
        .select(`
          association_id,
          associations (
            id,
            name,
            environment
          )
        `)
        .eq("user_id", user.id);

      const visible =
        data?.map((x: any) => x.associations).filter(Boolean) || [];

      setAssociations(visible);

      if (!activeHoa && visible.length > 0) {
        setActiveHoa(visible[0]);
      }

      setLoading(false);
    };

    load();
  }, []);

  if (loading) {
    return <div style={styles.loading}>Loading HOA...</div>;
  }

  if (associations.length === 0) return null;

  // 🟢 SPLIT FOR UI GROUPING
  const production = associations.filter(
    (hoa: any) => hoa.environment === "production"
  );

  const sandbox = associations.filter(
    (hoa: any) => hoa.environment === "sandbox"
  );

  return (
    <div style={styles.wrapper}>
      {/* HEADER */}
      <div style={styles.header} onClick={() => setOpen(!open)}>
        🏛️ HOA: {activeHoa?.name || "Select HOA"} ⌄
      </div>

      {/* DROPDOWN */}
      {open && (
        <div style={styles.dropdown}>
          {/* 🟢 PRODUCTION */}
          {production.length > 0 && (
            <>
              <div style={styles.sectionHeader}>Production HOAs</div>

              {production.map((hoa) => (
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
            </>
          )}

          {/* 🟡 SANDBOX */}
          {sandbox.length > 0 && (
            <>
              <div style={styles.sectionHeader}>🧪 Sandbox HOAs</div>

              {sandbox.map((hoa) => (
                <div
                  key={hoa.id}
                  style={{
                    ...styles.item,
                    color: "#ffcc00",
                  }}
                  onClick={() => {
                    setActiveHoa(hoa);
                    setOpen(false);
                  }}
                >
                  {hoa.name}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* =========================
   STYLES
========================= */

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

  sectionHeader: {
    fontSize: 11,
    fontWeight: 700,
    color: "#9CA3AF",
    padding: "8px 10px",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    background: "rgba(0,0,0,0.05)",
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