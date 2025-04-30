export default function CompanyInfo() {
  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Company</h1>
      <input className="border p-2 w-full mb-4" placeholder="Company Name" />
      <input className="border p-2 w-full mb-4" placeholder="Industry" />
      <button className="bg-black text-white px-4 py-2 rounded">Next</button>
    </div>
  );
}
