import { useState } from 'react';
import { runCampaign } from '../../lib/campaigns/runCampaign';

export default function ExecuteCampaignPage() {
  const [status, setStatus] = useState<string | null>(null);

  const handleRun = () => {
    const result = runCampaign();
    setStatus(result);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Execute Campaign</h1>
      <button onClick={handleRun} className="bg-black text-white px-4 py-2 rounded">
        Run Campaign
      </button>
      {status && (
        <div className="mt-4 text-green-700 font-semibold">
          {status}
        </div>
      )}
    </div>
  );
}
