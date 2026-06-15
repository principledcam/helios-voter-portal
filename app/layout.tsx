import "./globals.css";

export const metadata = {
  title: "Helios App",
  description: "Auth system with Supabase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={styles.body}>
        <div style={styles.shell}>
          {children}
        </div>
      </body>
    </html>
  );
}

const styles: Record<string, React.CSSProperties> = {
  body: {
    margin: 0,
    fontFamily: "Arial, sans-serif",
    background: "#f5f7fb",
  },
  shell: {
    minHeight: "100vh",
  },
};