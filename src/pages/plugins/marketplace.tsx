import { useAvailablePlugins } from '../../hooks/useAvailablePlugins';

export default function PluginMarketplace() {
  const plugins = useAvailablePlugins();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Plugin Marketplace</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {plugins.map((plugin, i) => (
          <div key={i} className="border p-4 rounded bg-white shadow">
            <h2 className="text-lg font-semibold">{plugin.name}</h2>
            <p className="text-sm text-gray-600 mb-2">{plugin.description}</p>
            <p className="text-xs text-gray-500 mb-4">Version: {plugin.version}</p>
            <button
              className="bg-black text-white px-4 py-2 rounded text-sm"
              onClick={() => alert(`Installing ${plugin.name}...`)}
            >
              Install
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
