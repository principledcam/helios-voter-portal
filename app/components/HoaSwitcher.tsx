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

      // 🟢 GET USER ROLE + ACCESS
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, association_id")
        .eq("id", user.id)
        .single();

      const role = profile?.role;
      const userAssociationId = profile?.association_id;

      // 🟢 FETCH ALL HOAS (NO FILTER HERE)
      const { data: associationsData, error } = await supabase
        .from("associations")
        .select("*");

      console.log("HOA SWITCHER DATA:", associationsData);
      console.log("HOA SWITCHER ERROR:", error);

      let visibleHOAs = associationsData || [];

      // 🛠 SYSTEM ADMIN — sees everything
      if (role === "system_admin") {
        visibleHOAs = associationsData || [];
      }

      // 👤 HOA ADMIN — ONLY assigned HOA
      if (role === "hoa_admin") {
        visibleHOAs =
          associationsData?.filter(
            (hoa: any) => hoa.id === userAssociationId
          ) || [];
      }

      // 👤 MEMBER — same as HOA admin (safe default)
      if (role === "member") {
        visibleHOAs =
          associationsData?.filter(
            (hoa: any) => hoa.id === userAssociationId
          ) || [];
      }

      setAssociations(visibleHOAs);

      // 🟢 AUTO SELECT FIRST HOA
      if (!activeHoa && visibleHOAs.length > 0) {
        setActiveHoa(visibleHOAs[0]);
      }

      setLoading(false);
    };

    load();
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
                setActiveHoa(hoa);
                setOpen(false);
              }}
            >
              {hoa.name}
              {hoa.environment === "sandbox" ? " (Sandbox)" : ""}
              {hoa.environment === "production" ? " (Production)" : ""}
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