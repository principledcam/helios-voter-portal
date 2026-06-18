"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminAuditRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/audit");
  }, [router]);

  return (
    <p style={{ padding: 20, fontSize: 14, color: "#666" }}>
      Redirecting to audit logs...
    </p>
  );
}