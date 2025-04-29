import { useStrategyRecommendations } from '../../hooks/useStrategyRecommendations';

export default function StrategyRecommenderPage() {
  const strategies = useStrategyRecommendations();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">AI Strategy Recommender</h1>
      <div className="space-y-4">
        {strategies.map((rec, i) => (
          <div key={i} className="border p-4 rounded bg-white shadow">
            <h2 className="text-lg font-semibold">{rec.title}</h2>
            <p className="text-sm text-gray-600">{rec.description}</p>
            <ul className="text-sm list-disc ml-6 mt-2">
              {rec.actions.map((action, j) => (
                <li key={j}>{action}</li>
              ))}
            </ul>
            <p className="text-xs text-gray-400 mt-2">Confidence Score: {rec.score}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
