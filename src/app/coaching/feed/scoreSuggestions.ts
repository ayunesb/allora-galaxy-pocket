
type Strategy = {
  title: string;
  description: string;
  impact: string;
  baseScore?: number;
};

type FeedbackLog = {
  strategy_title: string;
  action: "used" | "dismissed";
};

export function scoreSuggestions(strategies: Strategy[], feedback: FeedbackLog[]) {
  const map: Record<string, { used: number; dismissed: number }> = {};

  feedback.forEach((f) => {
    if (!map[f.strategy_title]) map[f.strategy_title] = { used: 0, dismissed: 0 };
    map[f.strategy_title][f.action]++;
  });

  return strategies
    .map((s) => {
      const f = map[s.title] || { used: 0, dismissed: 0 };
      const score = (s.baseScore || 1) + f.used * 2 - f.dismissed;
      return { ...s, score };
    })
    .sort((a, b) => b.score - a.score);
}
