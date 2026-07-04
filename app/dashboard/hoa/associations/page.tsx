"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

// 🧱 UI SYSTEM
import {
  PageHeader,
  Section,
  Card,
  Spinner,
} from "@/app/components/ui";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AssociationsPage() {
  const [associations, setAssociations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  // =========================
  // LOAD DATA
  // =========================
  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase
          .from("associations")
          .select("*")
          .order("name");

        if (error) throw error;

        setAssociations(data || []);
      } catch (err) {
        console.error(err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <>
        <Section title="Loading Associations">
          <Spinner />
        </Section>
      </>
    );
  }

  // =========================
  // ERROR
  // =========================
  if (error) {
    return (
      <>
        <Section title="Associations">
          <Card>
            <p style={{ color: "red" }}>
              Error loading associations.
            </p>
          </Card>
        </Section>
      </>
    );
  }

  // =========================
  // MAIN PAGE
  // =========================
  return (
    <>
      <PageHeader
        title="🏘️ Associations"
        subtitle="Manage homeowner associations within the platform"
      />

      <Section title="Association List">
        {associations.length === 0 ? (
          <Card>
            <p>No associations found.</p>
          </Card>
        ) : (
          associations.map((association) => (
            <Card key={association.id}>
              <h3>{association.name}</h3>

              <p>
                <strong>ID:</strong> {association.id}
              </p>

              {association.environment && (
                <p>
                  <strong>Environment:</strong>{" "}
                  {association.environment}
                </p>
              )}

              {association.status && (
                <p>
                  <strong>Status:</strong>{" "}
                  {association.status}
                </p>
              )}

              {typeof association.contract_signed !==
                "undefined" && (
                <p>
                  <strong>Contract Signed:</strong>{" "}
                  {association.contract_signed
                    ? "Yes"
                    : "No"}
                </p>
              )}
            </Card>
          ))
        )}
      </Section>
    </>
  );
}