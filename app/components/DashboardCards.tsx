export default function DashboardCards({
  totalUsers,
  activeSessions,
  newUsers,
}: {
  totalUsers: number;
  activeSessions: number;
  newUsers: number;
}) {
  return (
    <div style={styles.grid}>
      <Card title="Total Users" value={totalUsers} />
      <Card title="Active Sessions" value={activeSessions} />
      <Card title="New Users (7d)" value={newUsers} />
      <Card title="System Status" value="Healthy" />
    </div>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div style={styles.card}>
      <p style={styles.title}>{title}</p>
      <h2 style={styles.value}>{value}</h2>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 16,
    marginBottom: 20,
  },
  card: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
  },
  title: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
  },
  value: {
    fontSize: 22,
    margin: 0,
  },
};