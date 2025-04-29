import { useLeads } from '../../hooks/useLeads';

export default function LeadInboxPage() {
  const leads = useLeads();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Lead Inbox</h1>
      <table className="w-full text-left border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead, i) => (
            <tr key={i} className="border-t">
              <td className="p-2">{lead.name}</td>
              <td className="p-2">{lead.email}</td>
              <td className="p-2">{lead.status}</td>
              <td className="p-2">
                <button className="text-sm bg-blue-600 text-white px-2 py-1 rounded">
                  Assign
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
