export default function Spinner() {
  return (
    <div style={{ padding: 20 }}>
      <div
        style={{
          width: 18,
          height: 18,
          border: "2px solid #ccc",
          borderTop: "2px solid #28A8A8",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg) }
          100% { transform: rotate(360deg) }
        }
      `}</style>
    </div>
  );
}