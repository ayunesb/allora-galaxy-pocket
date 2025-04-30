export default function CompanyGoals() {
  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Goals</h1>
      <input className="border p-2 w-full mb-4" placeholder="e.g. 100 leads this month" />
      <input className="border p-2 w-full mb-4" placeholder="Improve MRR by 15%" />
      <button className="bg-green-600 text-white px-4 py-2 rounded">Finish</button>
    </div>
  );
}
