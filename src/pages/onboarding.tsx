import { useState } from 'react';
import { generateStrategy } from '../agents/CEO_Agent';

export default function OnboardingPage() {
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [strategy, setStrategy] = useState<any>(null);

  const submit = () => {
    const companyData = { name, industry };
    const newStrategy = generateStrategy(companyData);
    setStrategy(newStrategy);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">AI CEO Onboarding</h1>
      <input className="border p-2 w-full mb-2" placeholder="Company Name" onChange={e => setName(e.target.value)} />
      <input className="border p-2 w-full mb-2" placeholder="Industry" onChange={e => setIndustry(e.target.value)} />
      <button onClick={submit} className="bg-black text-white px-4 py-2 rounded">Generate Strategy</button>

      {strategy && (
        <div className="mt-6 bg-gray-100 p-4 rounded">
          <h2 className="font-bold text-lg">{strategy.title}</h2>
          <p>{strategy.summary}</p>
          <ul className="list-disc ml-6 mt-2">
            {strategy.goals.map((goal: string, i: number) => <li key={i}>{goal}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
