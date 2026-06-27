export type Invite = {
  id: string;
  email: string;
  role: string | null;
  invite_code: string;
  consumed: boolean;
  revoked: boolean;
  created_at: string;
  expires_at: string;
  association_id: string;
};