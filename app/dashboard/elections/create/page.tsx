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
if (!title) return alert("Title required");

```
setLoading(true);

const currentUser = user || (await loadUser());

if (!currentUser) {
  alert("You must be logged in");
  setLoading(false);
  return;
}

const { data, error } = await supabase
  .from("elections")
  .insert({
    title,
    description,
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

if (error) {
  alert(error.message);
  return;
}

router.push(`/dashboard/elections/${data.id}/edit`);
```

};

return (
<div style={{ maxWidth: 800 }}> <h1>Create Election</h1>

```
  <div style={{ background: "#fff", padding: 20, borderRadius: 10 }}>
    <h3>Step 1: Election Setup</h3>

    <input
      placeholder="Election title"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      style={{ width: "100%", padding: 10, marginBottom: 10 }}
    />

    <textarea
      placeholder="Description"
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      style={{ width: "100%", padding: 10, marginBottom: 10 }}
    />

    <label style={{ display: "block", marginBottom: 8 }}>
      <input
        type="checkbox"
        checked={anonymous}
        onChange={(e) => setAnonymous(e.target.checked)}
      />
      Anonymous voting
    </label>

    <label style={{ display: "block", marginBottom: 15 }}>
      <input
        type="checkbox"
        checked={allowMultipleVotes}
        onChange={(e) => setAllowMultipleVotes(e.target.checked)}
      />
      Allow multiple votes
    </label>

    <button
      onClick={createElection}
      style={{
        padding: 10,
        background: "#08224D",
        color: "#fff",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
      }}
    >
      {loading ? "Creating..." : "Create Election"}
    </button>
  </div>
</div>
```

);
}
