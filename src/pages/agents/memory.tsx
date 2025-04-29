import { usePromptHistory } from '../../hooks/usePromptHistory';

export default function AgentMemoryPage() {
  const logs = usePromptHistory();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">AI Agent Memory</h1>
      <div className="space-y-4">
        {logs.map((log, i) => (
          <div key={i} className="border p-4 rounded bg-white shadow">
            <p className="font-semibold text-sm text-gray-800">Prompt: {log.prompt}</p>
            <p className="text-sm text-gray-600 mt-1">Response: {log.response}</p>
            <p className="text-xs mt-1 text-gray-400">Timestamp: {log.timestamp}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
