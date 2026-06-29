import { theme } from "@/app/styles/theme";

export default function Table({
  headers,
  children,
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        background: theme.colors.card,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.md,
        overflow: "hidden",
      }}
    >
      <thead>
        <tr>
          {headers.map((h) => (
            <th
              key={h}
              style={{
                textAlign: "left",
                padding: 10,
                fontSize: 12,
                background: "#F1F5F9",
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>{children}</tbody>
    </table>
  );
}