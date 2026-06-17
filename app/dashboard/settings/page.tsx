export default function SettingsPage() {
  return (
    <div style={{ maxWidth: 800 }}>
      <h1>Settings</h1>
      <p>Account & system preferences</p>

      <div style={{ marginTop: 20 }}>
        <h3>Profile Settings</h3>
        <p>Update your account details and preferences here.</p>
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>System Settings</h3>
        <p>HOA configuration and permissions.</p>
      </div>
    </div>
  );
}