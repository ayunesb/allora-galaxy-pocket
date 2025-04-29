import { useFeedback } from '../../hooks/useFeedback';

export default function FeedbackEnginePage() {
  const feedback = useFeedback();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Feedback Intelligence</h1>
      <div className="space-y-4">
        {feedback.map((entry, i) => (
          <div key={i} className="border p-4 rounded bg-white shadow">
            <p className="text-sm font-semibold">Feature: {entry.feature}</p>
            <p className="text-sm text-gray-600 mt-1">Feedback: {entry.comment}</p>
            <p className="text-xs text-gray-400 mt-1">Rating: {entry.rating} • {entry.timestamp}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
