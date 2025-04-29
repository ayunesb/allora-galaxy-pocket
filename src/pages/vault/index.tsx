import { useStrategies } from '../../hooks/useStrategies';

export default function StrategyVaultPage() {
  const strategies = useStrategies();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Strategy Vault</h1>
      <div className="space-y-4">
        {strategies.map((strategy, i) => (
          <div key={i} className="border p-4 rounded bg-white shadow">
            <h2 className="text-lg font-semibold">{strategy.title}</h2>
            <p className="text-sm text-gray-600 mb-2">{strategy.summary}</p>
            <ul className="text-sm list-disc ml-6">
              {strategy.goals.map((goal, j) => (
                <li key={j}>{goal}</li>
              ))}
            </ul>
            <p className="text-xs text-gray-400 mt-2">Generated: {strategy.generatedAt}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
