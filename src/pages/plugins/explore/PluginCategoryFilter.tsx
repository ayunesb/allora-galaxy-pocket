
interface PluginCategoryFilterProps {
  value: string | null;
  onChange: (value: string | null) => void;
}
export function PluginCategoryFilter({ value, onChange }: PluginCategoryFilterProps) {
  return (
    <div className="mb-6">
      <label 
        htmlFor="category-select" 
        className="block text-sm font-medium text-foreground dark:text-gray-300 mb-2"
      >
        Filter by Category
      </label>
      <select 
        id="category-select"
        className="w-full border rounded p-2 bg-background dark:bg-gray-800 text-foreground dark:text-white border-border dark:border-gray-700"
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
      >
        <option value="">All Categories</option>
        <option value="Marketing">Marketing</option>
        <option value="Sales">Sales</option>
        <option value="Automation">Automation</option>
        <option value="Analytics">Analytics</option>
      </select>
    </div>
  );
}
