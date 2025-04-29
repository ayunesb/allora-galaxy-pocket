import { useSystemHealth } from '../../hooks/useSystemHealth';

export default function SystemHealthPage() {
  const logs = useSystemHealth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">System Health & Logs</h1>
      <div className="space-y-4">
        {logs.map((log, i) => (
          <div key={i} className="border p-4 rounded bg-white shadow">
            <p className="text-sm text-gray-800">{log.message}</p>
            <p className={`text-xs mt-1 ${log.level === 'error' ? 'text-red-500' : 'text-gray-500'}`}>
              {log.level.toUpperCase()} • {log.timestamp}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
