"use client";

import { useHoa } from "@/app/context/HoaContext";
import { useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from(table).select(options?.select || "*");

      /**
       * 🔥 AUTO HOA FILTER
       * Applies only if table supports association_id
       */
      if (activeHoa?.id) {
        query = query.eq("association_id", activeHoa.id);
      }

      /**
       * 🔧 Optional extra filters
       */
      if (options?.filters) {
        query = options.filters(query);
      }

      const { data, error } = await query;

      if (error) throw error;

      setData(data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // re-run when HOA changes
  }, [activeHoa?.id]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}