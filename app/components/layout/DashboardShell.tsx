"use client";

import Image from "next/image";
import { useHoa } from "@/app/context/HoaContext";
import HoaSwitcher from "@/app/components/HoaSwitcher";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { theme } from "@/app/styles/theme";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { activeHoa } = useHoa();
  const pathname = usePathname();

  // normalize once
  const normalizedPath = pathname?.replace(/\/$/, "");

  // EXACT match = no overlap bugs
  const isActive = (href: string) => {
    const normalizedHref = href.replace(/\/$/, "");
    return normalizedPath === normalizedHref;
  };

  return (
    <div style={styles.wrapper}>

      {/* SIDEBAR */}
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

        {/* HOA SWITCHER */}
        <div style={styles.switcher}>
          <HoaSwitcher />
        </div>

        {/* NAVIGATION */}
        <nav style={styles.nav}>

          <NavItem
            href="/dashboard"
            label="Overview"
            pathname={normalizedPath}
            isActive={isActive}
          />

          <NavItem
            href="/dashboard/elections"
            label="Elections"
            pathname={normalizedPath}
            isActive={isActive}
          />

          <NavItem
            href="/dashboard/hoa/invitations"
            label="Invitations"
            pathname={normalizedPath}
            isActive={isActive}
          />

          <NavItem
            href="/dashboard/hoa/invitations/analytics"
            label="Analytics"
            pathname={normalizedPath}
            isActive={isActive}
          />

          <NavItem
            href="/dashboard/admin"
            label="Admin"
            pathname={normalizedPath}
            isActive={isActive}
          />

        </nav>

        {/* ACTIVE HOA */}
        <div style={styles.hoaBox}>
          <div style={{ fontSize: 11, color: "#A7C4E8" }}>
            Active HOA
          </div>

          <div style={{ fontWeight: 600, color: "#FFFFFF" }}>
            {activeHoa?.name || "None Selected"}
          </div>

          <div
            style={{
              marginTop: 20,
              fontSize: 11,
              color: "#8FB3D9",
              borderTop: "1px solid rgba(255,255,255,.15)",
              paddingTop: 12,
            }}
          >
            <strong>PrincipledVote™</strong>
            <br />
            Version 1.0
          </div>
        </div>

      </aside>

      {/* MAIN */}
      <main style={styles.main}>
        {children}
      </main>

    </div>
  );
}

/* =========================
   NAV ITEM
========================= */

function NavItem({
  href,
  label,
  pathname,
  isActive,
}: {
  href: string;
  label: string;
  pathname: string;
  isActive: (href: string) => boolean;
}) {
  const active = isActive(href);

  return (
    <Link
      href={href}
      style={{
        ...styles.link,
        backgroundColor: active ? "#12B3B6" : "transparent",
        color: active ? "#FFFFFF" : "#E5EEF7",
        fontWeight: active ? 700 : 500,
      }}
    >
      {label}
    </Link>
  );
}

/* =========================
   STYLES
========================= */

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: "flex",
    minHeight: "100vh",
    background: theme.colors.background,
  },

  sidebar: {
    width: 260,
    background: "#08224D",
    color: "#FFFFFF",
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
    borderBottom: "1px solid rgba(255,255,255,.12)",
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
    color: "#E5EEF7",
    textDecoration: "none",
    padding: "10px 12px",
    borderRadius: 8,
    display: "block",
    transition: "all 0.2s ease",
  },

  hoaBox: {
    marginTop: "auto",
    padding: 14,
    borderRadius: 8,
    background: "#0E2E63",
    color: "#FFFFFF",
    borderTop: "1px solid rgba(255,255,255,.15)",
  },

  main: {
    flex: 1,
    padding: 30,
  },
};