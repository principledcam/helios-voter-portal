"use client";

import { useRouter } from "next/navigation";

export default function HOAAdminHome() {
  const router = useRouter();

  return (
    <div style={{ padding: 30 }}>
      <h1>🏛️ HOA Admin Portal</h1>

      <div style={{ display: "grid", gap: 10, maxWidth: 400 }}>

        <button onClick={() => router.push("/dashboard/hoa/associations")}>
          🏘️ Manage Associations
        </button>

        <button onClick={() => router.push("/dashboard/hoa/members")}>
          👥 Manage Members
        </button>

        <button onClick={() => router.push("/dashboard/hoa/invites")}>
          ✉️ Invite Members
        </button>

      </div>
    </div>
  );
}