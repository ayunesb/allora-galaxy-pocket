export default function PluginCenter() {
  const plugins = [
    { name: "Strategy Sync", enabled: true },
    { name: "Agent XP Logger", enabled: false },
    { name: "CRM Enhancer", enabled: true }
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Plugin Center</h1>
      <ul className="space-y-4">
        {plugins.map((p, i) => (
          <li key={i} className="p-4 border rounded shadow flex justify-between items-center bg-white">
            <span>{p.name}</span>
            <button className={`px-3 py-1 rounded text-sm ${p.enabled ? 'bg-green-600 text-white' : 'bg-gray-300'}`}>
              {p.enabled ? "Enabled" : "Disabled"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
