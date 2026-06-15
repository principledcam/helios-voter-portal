"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // 1. Get auth code from URL
        const code = searchParams.get("code");

        // 2. CRITICAL: exchange code for session
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error("Auth exchange error:", error.message);
            router.push("/login");
            return;
          }
        }

        // 3. Verify session exists
        const { data } = await supabase.auth.getSession();

        if (data.session) {
          router.push("/dashboard");
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error(err);
        router.push("/login");
      }
    };

    handleAuth();
  }, [router, searchParams]);

  return (
    <div style={{ padding: 20 }}>
      <p>Signing you in...</p>
    </div>
  );
}