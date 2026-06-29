import Card from "./Card";

export default function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <div style={{ fontSize: 12, color: "#6B7280" }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700 }}>
        {value}
      </div>
    </Card>
  );
}