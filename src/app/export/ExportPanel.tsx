
import { useExport } from "@/hooks/useExport";

export default function ExportPanel() {
  const { downloadCSV, emailExport, isLoading } = useExport();

  return (
    <div className="p-6 max-w-xl space-y-4">
      <h2 className="text-xl font-bold">📤 Export Center</h2>
      {(["strategies", "leads", "kpis"] as const).map((type) => (
        <div 
          key={type} 
          className="bg-white p-4 rounded shadow flex justify-between items-center"
        >
          <span className="capitalize">{type}</span>
          <div className="flex gap-2">
            <button 
              onClick={() => downloadCSV(type)} 
              disabled={isLoading}
              className="bg-gray-200 text-sm px-2 py-1 rounded disabled:opacity-50"
            >
              Download
            </button>
            <button 
              onClick={() => emailExport(type)} 
              disabled={isLoading}
              className="bg-blue-600 text-white text-sm px-3 py-1 rounded disabled:opacity-50"
            >
              Email
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
