"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { useHoa } from "@/app/context/HoaContext";

// UI SYSTEM
import {
  PageHeader,
  Section,
  Card,
} from "@/app/components/ui";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CreateElectionPage() {
  const router = useRouter();
  const { activeHoa } = useHoa();

  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [allowMultipleVotes, setAllowMultipleVotes] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
    return data.user;
  };

  const createElection = async () => {
    if (!title) {
      alert("Title required");
      return;
    }

    if (!activeHoa?.id) {
      alert("No HOA selected.");
      return;
    }

    setLoading(true);

    const currentUser = user || (await loadUser());

    if (!currentUser) {
      alert("You must be logged in");
      setLoading(false);
      return;
    }

    const { data: election, error } = await supabase
      .from("elections")
      .insert({
        title,
        description,
        association_id: activeHoa.id,
        environment: activeHoa.environment,
        user_id: currentUser.id,
        status: "draft",
        settings: {
          anonymous,
          allow_multiple_votes: allowMultipleVotes,
        },
      })
      .select()
      .single();

    setLoading(false);

    if (error || !election) {
      alert(error?.message || "Error creating election");
      return;
    }

    router.push(`/dashboard/elections/${election.id}/edit`);
  };

  return (
    <>
      {/* =========================
          HEADER
      ========================= */}
      <PageHeader
        title="🗳️ Create Election"
        subtitle="Configure a new HOA voting session"
      />

      {/* =========================
          FORM SECTION
      ========================= */}
      <Section title="Election Setup">
        <Card>
          <div style={styles.form}>
            {/* TITLE */}
            <input
              placeholder="Election title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={styles.input}
            />

            {/* DESCRIPTION */}
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={styles.textarea}
            />

            {/* OPTIONS */}
            <label style={styles.label}>
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
              />
              Anonymous voting
            </label>

            <label style={styles.label}>
              <input
                type="checkbox"
                checked={allowMultipleVotes}
                onChange={(e) =>
                  setAllowMultipleVotes(e.target.checked)
                }
              />
              Allow multiple votes
            </label>

            {/* SUBMIT BUTTON */}
            <button
              onClick={createElection}
              disabled={loading}
              style={styles.button}
            >
              {loading ? "Creating..." : "Create Election"}
            </button>
          </div>
        </Card>
      </Section>
    </>
  );
}

// =========================
// STYLES
// =========================
const styles: Record<string, React.CSSProperties> = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  input: {
    width: "100%",
    padding: 10,
    borderRadius: 6,
    border: "1px solid #ddd",
  },

  textarea: {
    width: "100%",
    padding: 10,
    borderRadius: 6,
    border: "1px solid #ddd",
    minHeight: 120,
  },

  label: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 14,
  },

  button: {
    padding: 12,
    background: "#08224D",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
    marginTop: 10,
  },
};