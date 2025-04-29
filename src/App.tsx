
import SelectFeature from './components/SelectFeature';

export default function App() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-green-800 mb-6">Allora OS</h1>
      <p className="mb-6 text-gray-600">
        Your project has been updated to the latest Lovable version. You can now use new features like the "Select" functionality.
      </p>
      <SelectFeature />
      <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-md">
        <p className="text-green-800">
          ✅ App is rendering with the latest Lovable features enabled
        </p>
      </div>
    </div>
  );
}
