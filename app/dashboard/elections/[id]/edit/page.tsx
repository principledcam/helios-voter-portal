"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SidebarLayout from "@/app/components/SidebarLayout";
import { createBrowserClient } from "@supabase/ssr";

import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragEndEvent,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/* ---------------- SORTABLE ITEM ---------------- */
function SortableBallot({ ballot, onDelete, disabled, onAddOption }: any) {
  const { attributes, setNodeRef, transform, transition } =
    useSortable({ id: String(ballot.id) });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: 15,
    background: "#fafafa",
    border: "1px solid #eee",
    borderRadius: 10,
    marginBottom: 10,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>

      {/* 🔥 DRAG HANDLE ONLY */}
      <div
        style={{ cursor: "grab", fontSize: 12, color: "#666" }}
      >
        ⠿ Drag
      </div>

      <strong>{ballot.title}</strong>

      {/* OPTIONS */}
      <div>
        {ballot.options?.map((opt: any) => (
          <div
            key={opt.id}
            style={{
              padding: 6,
              background: "#fff",
              marginTop: 5,
              border: "1px solid #eee",
              borderRadius: 6,
            }}
          >
            👤 {opt.label}
          </div>
        ))}
      </div>

      {/* ADD OPTION */}
      {!disabled && (
        <AddOption ballotId={ballot.id} onAddOption={onAddOption} />
      )}

      {/* DELETE */}
      <button
        onClick={() => onDelete(ballot.id)}
        disabled={disabled}
        style={{
          background: "red",
          color: "#fff",
          padding: 6,
          border: "none",
          borderRadius: 6,
        }}
      >
        Delete
      </button>
    </div>
  );
}

/* ---------------- ADD OPTION ---------------- */
function AddOption({ ballotId, onAddOption }: any) {
  const [value, setValue] = useState("");

  const handleAdd = async () => {
    if (!value) return;

    const { data, error } = await supabase
      .from("ballot_options")
      .insert({
        ballot_id: ballotId,
        label: value,
      })
      .select()
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    setValue("");

    // 🔥 FIXED: force parent refresh
    await onAddOption?.();
  };

  return (
    <div>
      <input
        placeholder="Enter candidate name"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{ width: "100%", padding: 6 }}
      />
      <button onClick={handleAdd}>Add Option</button>
    </div>
  );
}

/* ---------------- PAGE ---------------- */
export default function EditElectionPage() {
  const { id } = useParams();
  const router = useRouter();

  const [ballots, setBallots] = useState<any[]>([]);
  const [status, setStatus] = useState("draft");
  const [newQuestion, setNewQuestion] = useState("");

  const isEditable = status === "draft";

  const sensors = useSensors(useSensor(PointerSensor));

  /* ---------------- LOAD ---------------- */
  const load = async () => {
    const { data: ballotsData } = await supabase
      .from("ballots")
      .select("*")
      .eq("election_id", id)
      .order("position", { ascending: true });

    const { data: optionsData } = await supabase
      .from("ballot_options")
      .select("*");

    const enriched = (ballotsData || []).map((b) => ({
      ...b,
      options: optionsData?.filter((o) => o.ballot_id === b.id) || [],
    }));

    setBallots(enriched);
  };

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    const init = async () => {
      const { data: electionData } = await supabase
        .from("elections")
        .select("*")
        .eq("id", id)
        .single();

      setStatus(electionData?.status || "draft");

      await load();
    };

    init();
  }, [id]);

  /* ---------------- ADD BALLOT ---------------- */
  const addBallot = async () => {
    if (!newQuestion) return;

    const { error } = await supabase.from("ballots").insert({
      election_id: id,
      title: newQuestion,
      position: ballots.length,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setNewQuestion("");
    await load();
  };

  /* ---------------- DELETE (FIXED) ---------------- */
  const deleteBallot = async (ballotId: string) => {
    const { error } = await supabase
      .from("ballots")
      .delete()
      .eq("id", ballotId);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    await load();
  };

  /* ---------------- ADD OPTION REFRESH ---------------- */
  const refreshAfterOption = async () => {
    await load();
  };

  return (
    <SidebarLayout>
      <div style={{ maxWidth: 900 }}>
        <h1>🧠 Admin Control Center</h1>

        <div>Status: {status.toUpperCase()}</div>

        <input
          placeholder="Enter ballot question"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          style={{ width: "100%", padding: 8, marginTop: 10 }}
        />

        <button onClick={addBallot} disabled={!isEditable}>
          Add Ballot
        </button>

        {/* BALLOTS */}
        <DndContext sensors={sensors} collisionDetection={closestCenter}>
          <SortableContext
            items={ballots.map((b) => String(b.id))}
            strategy={verticalListSortingStrategy}
          >
            {ballots.map((b) => (
              <SortableBallot
                key={b.id}
                ballot={b}
                onDelete={deleteBallot}
                onAddOption={refreshAfterOption}
                disabled={!isEditable}
              />
            ))}
          </SortableContext>
        </DndContext>

        <button
          style={{ marginTop: 20 }}
          onClick={() => router.push(`/dashboard/elections/${id}`)}
        >
          Go to Voting View →
        </button>
      </div>
    </SidebarLayout>
  );
}