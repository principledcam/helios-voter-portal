import { useHoa } from "@/app/context/HoaContext";
import { useEffect, useRef, useState, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";

// 🟢 SINGLE SOURCE OF TRUTH (sandbox HOA id)
const SANDBOX_HOA_ID = process.env.NEXT_PUBLIC_SANDBOX_HOA_ID!;

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type QueryOptions = {
  select?: string;
  filters?: (query: any) => any;
};

export function useHoaQuery(table: string, options?: QueryOptions) {
  const { activeHoa, isSandbox } = useHoa();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  // 🧠 prevents duplicate fetch loops
  const didFetch = useRef(false);

  const fetchData = useCallback(async () => {
    setError(null);

    // 🟢 FINAL HOA RESOLUTION (SANDBOX AWARE)
    const hoaId = isSandbox ? SANDBOX_HOA_ID : activeHoa?.id;
    const environment = isSandbox ? "sandbox" : "production";

    if (!hoaId) {
      setData([]);
      setLoading(false);
      return;
    }

    if (!didFetch.current) {
      setLoading(true);
    }

    try {
      let query = supabase
        .from(table)
        .select(options?.select || "*");
        query = query.eq("environment", environment);

      // 🟢 STEP 5 — ENFORCE QUERY SAFETY (REQUIRED ORDER)

      // 1. HOA SCOPING
      if (activeHoa?.id || isSandbox) {
        query = query.eq("association_id", hoaId);
      }

      // 2. ENVIRONMENT SCOPING (CRITICAL)
      const environment = isSandbox ? "sandbox" : "production";
      query = query.eq("environment", environment);

      // 3. OPTIONAL FILTERS
      if (options?.filters) {
        query = options.filters(query);
      }

      const { data, error } = await query;

      if (error) throw error;

      setData(data || []);
    } catch (err) {
      setError(err);
    } finally {
      didFetch.current = true;
      setLoading(false);
    }
  }, [table, activeHoa?.id, isSandbox]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}