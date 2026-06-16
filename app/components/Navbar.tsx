"use client";

import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Navbar() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setEmail(data.user?.email ?? null);
    };

    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>Helios</div>

      <div style={styles.right}>
        {email && <span style={styles.email}>{email}</span>}

        {email && (
          <button onClick={handleLogout} style={styles.button}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    height: 60,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 20px",
    background: "#fff",
    borderBottom: "1px solid #eee",
  },
  left: {
    fontWeight: 700,
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  email: {
    fontSize: 13,
    color: "#555",
  },
  button: {
    padding: "6px 10px",
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    borderRadius: 6,
  },
};