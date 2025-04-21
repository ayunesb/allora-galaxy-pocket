
export type LeadStatus = "MQL" | "SQL" | "Closed";

export interface Lead {
  id: string;
  name: string;
  email: string;
  status: LeadStatus;
  createdAt: string;
}
