"use client";

import { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useHoa } from "@/app/context/HoaContext";
import RoleGuard from "@/components/RoleGuard";
import {
  getInviteStatus,
} from "@/lib/invitations/inviteValidation";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Invite = {
  id: string;
  email: string;
  role: string | null;
  invite_code: string;
  consumed: boolean;
  revoked: boolean;
  created_at: string;
  expires_at: string;
  association_id: string;
};

export default function InvitationsPage() {
  const { activeHoa } = useHoa();

  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (activeHoa?.id) {
      loadInvites();
    }
  }, [activeHoa?.id]);

  async function loadInvites() {
    if (!activeHoa?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("association_invites")
      .select("*")
      .eq("association_id", activeHoa.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    }

    setInvites(data || []);
    setLoading(false);
  }

  const filteredInvites = useMemo(() => {
    return invites.filter((invite) => {
      const matchesEmail = invite.email
        .toLowerCase()
        .includes(search.toLowerCase());

      const status = getInviteStatus(invite);

      const matchesStatus =
        filter === "all" ||
        status.toLowerCase() === filter.toLowerCase();

      return matchesEmail && matchesStatus;
    });
  }, [invites, search, filter]);

  async function revokeInvite(id: string) {
    await fetch("/api/invitations/revoke", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        invite_id: id,
      }),
    });

    loadInvites();
  }

  async function resendInvite(id: string) {
    await fetch("/api/invitations/resend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        invite_id: id,
      }),
    });

    loadInvites();
  }

  if (loading) {
    return (
      <RoleGuard>
        <div style={{ padding: 30 }}>
          Loading invitations...
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard>
      <div style={{ padding: 30 }}>
        <h1>✉️ Invitations</h1>

        <div
          style={{
            marginBottom: 20,
            padding: 12,
            background: "#f5f5f5",
            borderRadius: 8,
          }}
        >
          <strong>Active HOA:</strong>{" "}
          {activeHoa?.name || "No HOA Selected"}
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <input
            placeholder="Search email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: 10,
              width: 300,
            }}
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="expired">Expired</option>
            <option value="revoked">Revoked</option>
          </select>
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Sent</th>
              <th>Expires</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredInvites.map((invite) => {
              const status = getInviteStatus(invite);

              return (
                <tr key={invite.id}>
                  <td>{invite.email}</td>

                  <td>{invite.role || "member"}</td>

                  <td>{status}</td>

                  <td>
                    {new Date(
                      invite.created_at
                    ).toLocaleDateString()}
                  </td>

                  <td>
                    {new Date(
                      invite.expires_at
                    ).toLocaleDateString()}
                  </td>

                  <td>
                    {status === "Pending" && (
                      <>
                        <button
                          onClick={() =>
                            resendInvite(invite.id)
                          }
                        >
                          Resend
                        </button>{" "}
                        <button
                          onClick={() =>
                            revokeInvite(invite.id)
                          }
                        >
                          Revoke
                        </button>
                      </>
                    )}

                    {status === "Expired" && (
                      <button
                        onClick={() =>
                          resendInvite(invite.id)
                        }
                      >
                        Resend
                      </button>
                    )}

                    {status === "Accepted" && "Accepted"}

                    {status === "Revoked" && "Revoked"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </RoleGuard>
  );
}