"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BRAND = {
  primary: "#08224D",
  accent: "#28A8A8",
  bg: "#F5F7FB",
  card: "#FFFFFF",
  text: "#08224D",
  muted: "#6B7280",
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (!data?.session) {
        setError("Login failed: no session returned.");
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 300));

      router.refresh();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <img
            src="/logo.png"
            alt="PrincipledVote Logo"
            style={styles.logo}
          />
        </div>

        <h1 style={styles.title}>Welcome Back</h1>

        <p style={styles.subtitle}>Sign in to PrincipledVote™</p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        {error && <p style={styles.error}>{error}</p>}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={styles.button}
        >
          {loading ? "Signing In..." : "Login"}
        </button>

        <p style={styles.notice}>
          Account creation is managed by your condo or HOA association administrator.
          <br />
          If you need access, please contact your association management team.
        </p>

        <p style={styles.footer}>
          Powered by{" "}
          <span style={{ color: BRAND.accent }}>PrincipledVote™</span>
        </p>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: BRAND.bg,
    fontFamily: "Arial, sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: 400,
    background: BRAND.card,
    padding: 32,
    borderRadius: 14,
    boxShadow: "0 12px 35px rgba(0,0,0,0.08)",
    textAlign: "center",
  },

  logoWrap: {
    marginBottom: 18,
  },

  logo: {
    height: 72,
    width: "auto",
    objectFit: "contain",
  },

  title: {
    marginBottom: 6,
    fontSize: 24,
    color: BRAND.primary,
    fontWeight: 700,
  },

  subtitle: {
    marginBottom: 20,
    color: BRAND.muted,
    fontSize: 14,
  },

  input: {
    width: "100%",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    border: "1px solid #E5E7EB",
    outline: "none",
  },

  button: {
    width: "100%",
    padding: 12,
    background: BRAND.accent,
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    marginTop: 8,
    fontWeight: 600,
  },

  error: {
    color: "#DC2626",
    fontSize: 13,
    marginBottom: 10,
  },

  notice: {
    marginTop: 16,
    fontSize: 13,
    lineHeight: 1.5,
    color: BRAND.muted,
  },

  footer: {
    marginTop: 18,
    fontSize: 12,
    color: BRAND.muted,
  },
};