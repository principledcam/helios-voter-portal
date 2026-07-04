"use client";

import Image from "next/image";
import { useHoa } from "@/app/context/HoaContext";
import HoaSwitcher from "@/app/components/HoaSwitcher";
import Link from "next/link";
import { theme } from "@/app/styles/theme";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { activeHoa } = useHoa();

  return (
    <div style={styles.wrapper}>

      {/* =========================
          SIDEBAR
      ========================= */}
      <aside style={styles.sidebar}>

        {/* BRAND */}
        <div style={styles.brand}>
  <Image
    src="/images/principledvote-logo.png"
    alt="PrincipledVote eVoting System"
    width={190}
    height={72}
    priority
    style={{
      width: "100%",
      height: "auto",
      objectFit: "contain",
    }}
  />
</div>

        {/* HOA SWITCHER (RESTORED) */}
        <div style={styles.switcher}>
          <HoaSwitcher />
        </div>

        {/* NAVIGATION */}
        <nav style={styles.nav}>
          <NavItem href="/dashboard" label="Overview" />
          <NavItem href="/dashboard/elections" label="Elections" />
          <NavItem
            href="/dashboard/hoa/invitations"
            label="Invitations"
          />
          <NavItem
            href="/dashboard/hoa/invitations/analytics"
            label="Analytics"
          />
          <NavItem href="/dashboard/admin" label="Admin" />
        </nav>

        {/* ACTIVE HOA */}
        <div style={styles.hoaBox}>
          <div
            style={{
              fontSize: 11,
              color: "#888",
            }}
          >
            Active HOA
          </div>

          <div
            style={{
              fontWeight: 600,
            }}
          >
            {activeHoa?.name || "None Selected"}
          </div>
        </div>
      </aside>

      {/* =========================
          MAIN CONTENT
      ========================= */}
      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
}

// =========================
// NAV ITEM
// =========================

function NavItem({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link href={href} style={styles.link}>
      {label}
    </Link>
  );
}

// =========================
// STYLES
// =========================

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: "flex",
    minHeight: "100vh",
    background: theme.colors.background,
  },

  sidebar: {
    width: 240,
    background: "#111827",
    color: "#fff",
    padding: 20,
    display: "flex",
    flexDirection: "column",
  },

  brand: {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 24,
  paddingBottom: 16,
  borderBottom: "1px solid rgba(255,255,255,0.12)",
},

  switcher: {
    marginBottom: 20,
  },

  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    flex: 1,
  },

  link: {
    color: "#cbd5e1",
    textDecoration: "none",
    padding: "8px 10px",
    borderRadius: 6,
  },

  hoaBox: {
    marginTop: "auto",
    padding: 10,
    borderTop: "1px solid #333",
  },

  main: {
    flex: 1,
    padding: 30,
  },
};