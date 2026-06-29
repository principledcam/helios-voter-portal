export type DateRange = {
  start: Date;
  end: Date;
};

export type TrendResult = {
  current: number;
  previous: number;
  difference: number;
  percentChange: number;
};

export type InviteMetrics = {
  invitesCreated: number;
  emailsSent: number;
  emailsOpened: number;
  inviteClicks: number;
  accepted: number;
  revoked: number;
  expired: number;

  openRate: number;
  clickRate: number;
  acceptanceRate: number;
  overallConversion: number;
};

export type TimelinePoint = {
  label: string;
  value: number;
};