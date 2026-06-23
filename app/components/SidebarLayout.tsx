"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import HoaSwitcher from "@/app/components/HoaSwitcher";
import { useHoa } from "@/app/context/HoaContext";

const BRAND = {
  primary: "#08224D",
  accent: "#28A8A8",
  bg: "#F5F7FB",
  sidebar: "#061A33",
  text: "#E5E7EB",
  muted: "#9CA3AF",
};

export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);

  // 🟢 SANDBOX CONTEXT
  const { isSandbox } = useHoa();

  // 🟢 ROLE + HOA ACCESS CONTROL (ADDED AS REQUESTED)
  const [role, setRole] = useState<string | null>(null);
  const [userAssociationId, setUserAssociationId] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      setEmail(user?.email ?? null);

      if (!user?.id) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, association_id")
        .eq("id", user.id)
        .single();

      setRole(profile?.role ?? null);
      setUserAssociationId(profile?.association_id ?? null);
    };

    loadUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const isActive = (path: string) =>
    pathname === path
      ? {
          background: "rgba(40,168,168,0.15)",
          borderLeft: "3px solid #28A8A8",
          padding: "8px",
          borderRadius: 6,
          color: "#28A8A8",
        }
      : {
          padding: "8px",
          borderRadius: 6,
        };

  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        {/* LOGO */}
        <div style={styles.logo}>
          <img
            src="/logo.png"
            alt="Helios Logo"
            style={{
              height: 90,
              width: "auto",
              objectFit: "contain",
            }}
          />
        </div>

        {/* HOA SWITCHER */}
        <HoaSwitcher />

        {/* 🟢 SANDBOX TOGGLE */}
        <div style={{ marginTop: 10, marginBottom: 10 }}>
          <button
            onClick={() => setSandbox(!isSandbox)}
            style={{
              width: "100%",
              padding: "6px 10px",
              borderRadius: 6,
              background: isSandbox ? "#ffcc00" : "#111",
              color: isSandbox ? "#000" : "#fff",
              border: "1px solid rgba(255,255,255,0.15)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {isSandbox ? "🟡 Sandbox Mode ON" : "🟢 Production Mode"}
          </button>

          {isSandbox && (
            <div
              style={{
                marginTop: 6,
                fontSize: 11,
                color: "#ffcc00",
                textAlign: "center",
              }}
            >
              Sandbox Environment Active
            </div>
          )}
        </div>

        {/* NAV */}
        <nav style={styles.nav}>
          <Link
            href="/dashboard"
            style={{ ...styles.link, ...isActive("/dashboard") }}
          >
            Dashboard
          </Link>

          <Link
            href="/dashboard/admin"
            style={{ ...styles.link, ...isActive("/dashboard/admin") }}
          >
            Admin
          </Link>

          <Link
            href="/dashboard/audit"
            style={{ ...styles.link, ...isActive("/dashboard/audit") }}
          >
            Audit Logs
          </Link>

          <Link
            href="/dashboard/elections"
            style={{
              ...styles.link,
              ...(pathname.startsWith("/dashboard/elections")
                ? {
                    background: "rgba(40,168,168,0.15)",
                    borderLeft: "3px solid #28A8A8",
                    padding: "8px",
                    borderRadius: 6,
                    color: "#28A8A8",
                  }
                : {}),
            }}
          >
            🗳️ Elections
          </Link>

          <Link
            href="/dashboard/elections/create"
            style={{
              ...styles.link,
              ...(pathname === "/dashboard/elections/create"
                ? {
                    background: "rgba(40,168,168,0.15)",
                    borderLeft: "3px solid #28A8A8",
                    padding: "8px",
                    borderRadius: 6,
                    color: "#28A8A8",
                  }
                : {}),
            }}
          >
            ➕ Create Election
          </Link>

          <Link
            href="/dashboard/settings"
            style={{ ...styles.link, ...isActive("/dashboard/settings") }}
          >
            Settings
          </Link>
        </nav>

        {/* USER */}
        <div style={styles.bottom}>
          <div style={styles.email}>{email}</div>

          <button onClick={handleLogout} style={styles.button}>
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={styles.main}>{children}</main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    minHeight: "100vh",
    background: BRAND.bg,
  },

  sidebar: {
    width: 240,
    background: BRAND.sidebar,
    color: BRAND.text,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: 20,
    borderRight: "1px solid rgba(255,255,255,0.05)",
  },

  logo: {
    marginBottom: 20,
    padding: "16px 12px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 60,
    background: "rgba(255,255,255,0.03)",
    borderRadius: 8,
  },

  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginTop: 10,
  },

  link: {
    color: BRAND.muted,
    textDecoration: "none",
    fontSize: 14,
    display: "block",
  },

  bottom: {
    marginTop: "auto",
  },

  email: {
    fontSize: 12,
    color: BRAND.muted,
    marginBottom: 10,
    wordBreak: "break-all",
  },

  button: {
    width: "100%",
    padding: 10,
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 6,
    cursor: "pointer",
    background: "transparent",
    color: BRAND.text,
  },

  main: {
    flex: 1,
    padding: 40,
  },
};