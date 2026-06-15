"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseServer";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
}