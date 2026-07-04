"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { canManageHoa } from "@/lib/auth/permissions";
import { useHoa } from "@/app/context/HoaContext";

type RoleGuardProps = {
  children: React.ReactNode;
};

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RoleGuard({
  children,
}: RoleGuardProps) {
  const { activeHoa, setActiveHoa } = useHoa();

  console.log("RoleGuard render - activeHoa:", activeHoa);

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    async function initialize() {
      console.log("=================================");
      console.log("RoleGuard initialize()");
      console.log("=================================");

      let hoa = activeHoa;

      console.log("Initial activeHoa:", hoa);

      // -----------------------------
      // NO HOA SELECTED
      // -----------------------------
      if (!hoa) {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        console.log("Supabase user:", user);
        console.log("User error:", userError);

        if (!user) {
          console.error("❌ No authenticated user.");

          setAuthorized(false);
          setLoading(false);
          return;
        }

        const {
          data: memberships,
          error: membershipError,
        } = await supabase
          .from("association_members")
          .select(`
            association_id,
            role,
            associations:association_id (
              id,
              name,
              environment
            )
          `)
          .eq("user_id", user.id)
          .limit(1);

        console.log("Membership query error:", membershipError);
        console.log("Memberships returned:", memberships);

        if (!memberships || memberships.length === 0) {
          console.error("❌ No HOA memberships found.");

          setAuthorized(false);
          setLoading(false);
          return;
        }

        hoa = memberships[0].associations as any;

        console.log("Selected HOA:", hoa);

        setActiveHoa(hoa);
      }

      // -----------------------------
      // SAFETY CHECK
      // -----------------------------
      if (!hoa) {
        console.error("❌ HOA is still null.");

        setAuthorized(false);
        setLoading(false);
        return;
      }

      console.log("Checking permissions for HOA:", hoa.id);

      const allowed = await canManageHoa(hoa.id);

      console.log("Permission result:", allowed);

      setAuthorized(allowed);
      setLoading(false);
    }

    initialize();
  }, [activeHoa, setActiveHoa]);

  if (loading) {
    return (
      <div style={{ padding: 30 }}>
        Loading...
      </div>
    );
  }

  if (!authorized) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
        }}
      >
        <h1>403</h1>

        <h2>Access Denied</h2>

        <p>
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}