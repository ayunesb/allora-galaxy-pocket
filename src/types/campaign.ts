
export interface Campaign {
  id: string;
  name: string;
  status: "active" | "paused" | "draft";
  strategy_id?: string;
  created_at: string;
}
