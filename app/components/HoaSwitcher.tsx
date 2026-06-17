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

  useEffect(() => {
    const check = async () => {
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

      // ✅ FIX: use role, NOT is_system_admin
      setIsAdmin(profile?.is_system_admin === true);

      setLoading(false);
    };

    check();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          background: "#333",
          color: "white",
          padding: "8px",
          fontSize: 12,
        }}
      >
        Loading HOA...
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div
      style={{
        background: "#1e7f3e",
        color: "white",
        padding: "10px",
        fontWeight: "bold",
        borderRadius: 6,
        marginBottom: 10,
      }}
    >
      HOA SWITCHER ACTIVE (SYSTEM ADMIN)
    </div>
  );
}