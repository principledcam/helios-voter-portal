"use client";

import { useEffect, useState } from "react";
import { canManageHoa } from "@/lib/auth/permissions";
import { useHoa } from "@/app/context/HoaContext";

type RoleGuardProps = {
  children: React.ReactNode;
};

export default function RoleGuard({
  children,
}: RoleGuardProps) {
  const { activeHoa } = useHoa();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    async function checkPermission() {
      if (!activeHoa?.id) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      const allowed = await canManageHoa(activeHoa.id);

      setAuthorized(allowed);
      setLoading(false);
    }

    checkPermission();
  }, [activeHoa?.id]);

  if (loading) {
    return (
      <div style={{ padding: 30 }}>
        Checking permissions...
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