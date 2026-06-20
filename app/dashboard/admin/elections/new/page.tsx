"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CreateElectionPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [loading, setLoading] = useState(false);

  const updateOption = (value: string, index: number) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const createElection = async () => {
    setLoading(true);

    // 1. Create election
    const { data: election, error: e1 } = await supabase
      .from("elections")
      .insert({
        title,
        description,
      })
      .select()
      .single();

    if (e1 || !election) {
      alert(e1?.message || "Error creating election");
      setLoading(false);
      return;
    }

    // 2. Create ballots
    const ballots = options
      .filter((o) => o.trim() !== "")
      .map((o) => ({
        election_id: election.id,
        choice: o,
      }));

    const { error: e2 } = await supabase.from("ballots").insert(ballots);

    if (e2) {
      alert(e2.message);
      setLoading(false);
      return;
    }

    alert("Election created!");

    router.push("/dashboard/admin");
  };

  return (
          <div style={styles.card}>
        <h1>Create Election</h1>

        <input
          placeholder="Election title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={styles.input}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={styles.textarea}
        />

        <h3>Ballot Options</h3>

        {options.map((opt, i) => (
          <input
            key={i}
            placeholder={`Option ${i + 1}`}
            value={opt}
            onChange={(e) => updateOption(e.target.value, i)}
            style={styles.input}
          />
        ))}

        <button onClick={addOption} style={styles.secondary}>
          + Add Option
        </button>

        <button onClick={createElection} disabled={loading} style={styles.primary}>
          {loading ? "Creating..." : "Create Election"}
        </button>
      </div>
      );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: "#fff",
    padding: 30,
    borderRadius: 12,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    maxWidth: 600,
  },

  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    border: "1px solid #ddd",
  },

  textarea: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    border: "1px solid #ddd",
    minHeight: 80,
  },

  primary: {
    width: "100%",
    padding: 12,
    background: "#08224D",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    marginTop: 10,
  },

  secondary: {
    width: "100%",
    padding: 10,
    background: "#eee",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    marginBottom: 10,
  },
};