import pluginRegistry from '../../lib/plugins/pluginRegistry';

export default function PluginsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Installed Plugins</h1>
      <ul className="space-y-2">
        {pluginRegistry.map((plugin, i) => (
          <li key={i} className="border p-4 rounded bg-white">
            <h2 className="text-lg font-semibold">{plugin.name}</h2>
            <p className="text-sm text-gray-600">{plugin.description}</p>
            <span className="text-xs text-gray-500">Version: {plugin.version}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
