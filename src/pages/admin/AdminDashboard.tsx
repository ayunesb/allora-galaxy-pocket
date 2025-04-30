export default function AdminDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Active Users</p>
          <p className="text-2xl font-bold text-green-700">83</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Active Tenants</p>
          <p className="text-2xl font-bold text-green-700">14</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Plugins Installed</p>
          <p className="text-2xl font-bold text-green-700">12</p>
        </div>
      </div>
    </div>
  );
}
