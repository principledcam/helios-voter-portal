"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function HOAAdminPortal() {
const [members, setMembers] = useState<any[]>([]);
const [associations, setAssociations] = useState<any[]>([]);
const [loading, setLoading] = useState(true);

const [profile, setProfile] = useState<any>(null);
const [isAuthorized, setIsAuthorized] = useState(false);

useEffect(() => {
initialize();
}, []);

const initialize = async () => {
const { data: authData } = await supabase.auth.getUser();

const user = authData?.user;

if (!user) {
  setLoading(false);
  return;
}

// System Admin Check
const { data: profileData } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", user.id)
  .single();

setProfile(profileData);

if (profileData?.is_system_admin === true) {
  setIsAuthorized(true);
  await load();
  setLoading(false);
  return;
}

// HOA Admin Check
const { data: membership } = await supabase
  .from("association_members")
  .select("*")
  .eq("user_id", user.id)
  .eq("role", "hoa_admin")
  .limit(1);

if (membership && membership.length > 0) {
  setIsAuthorized(true);
  await load();
}

setLoading(false);

};

const load = async () => {
const { data: assoc } = await supabase
.from("associations")
.select("*");

setAssociations(assoc || []);

const { data: memberData } = await supabase
  .from("association_members")
  .select("*");

setMembers(memberData || []);

};

const approveUser = async (
user_id: string,
association_id: string
) => {
const role = "member";

const { error } = await supabase
  .from("association_members")
  .upsert(
    {
      user_id,
      association_id,
      role,
    },
    {
      onConflict: "user_id,association_id",
    }
  );

if (error) {
  console.error("Error approving user:", error.message);
  return;
}

await load();

};

if (loading) {
return (
<div style={{ padding: 20 }}>
Loading... </div>
);
}

if (!isAuthorized) {
return (
<div style={{ padding: 20 }}> <h1>Access Denied</h1> <p>
You do not have HOA Admin permissions. </p> </div>
);
}

return (
<div style={{ padding: 20 }}> <h1>🏛️ HOA Admin Portal</h1>

  {profile?.is_system_admin && (
    <p style={{ color: "#666" }}>
      System Administrator Access
    </p>
  )}

  <h3>Associations</h3>

  {associations.map((a) => (
    <div key={a.id}>
      <strong>{a.name}</strong> — {a.status}
    </div>
  ))}

  <h3 style={{ marginTop: 20 }}>
    Pending Users (Mock View)
  </h3>

  <p>
    (Next step: connect signup table or Supabase Auth logs)
  </p>
</div>

);
}
