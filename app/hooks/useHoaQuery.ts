import { useHoa } from "@/app/context/HoaContext";
import { useEffect, useRef, useState, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type QueryOptions = {
  select?: string;
  filters?: (query: any) => any;
};

export function useHoaQuery(table: string, options?: QueryOptions) {
  const { activeHoa } = useHoa();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  // 🧠 HARD GUARD: prevents duplicate fetch loops
  const didFetch = useRef(false);

  // =========================
  // FETCH DATA (STABLE CORE)
  // =========================
  const fetchData = useCallback(async () => {
    setError(null);

    // 🚨 FINAL FIX — BLOCK QUERY UNTIL HOA IS READY
    if (!activeHoa?.id) {
      setData([]);
      setLoading(false);
      return;
    }

    // 🔥 ONLY SHOW LOADING ON FIRST EVER FETCH
    if (!didFetch.current) {
      setLoading(true);
    }

    try {
      let query = supabase
        .from(table)
        .select(options?.select || "*");

      // HOA SCOPING
      query = query.eq("association_id", activeHoa.id);

      // OPTIONAL FILTERS
      if (options?.filters) {
        query = options.filters(query);
      }

      const { data, error } = await query;

      if (error) throw error;

      setData(data || []);
    } catch (err) {
      setError(err);
    } finally {
      // 🔥 MARK FIRST LOAD COMPLETE
      didFetch.current = true;
      setLoading(false);
    }
  }, [table, activeHoa?.id]);

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // =========================
  // MANUAL REFRESH
  // =========================
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