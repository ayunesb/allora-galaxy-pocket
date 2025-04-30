
import { useState } from "react";

type GoalsMultiSelectProps = {
  selectedGoals: string[];
  onToggleGoal: (goal: string) => void;
  onAddCustomGoal: (goal: string) => void;
  commonGoals: string[];
};

export const GoalsMultiSelect = ({
  selectedGoals,
  onToggleGoal,
  onAddCustomGoal,
  commonGoals,
}: GoalsMultiSelectProps) => {
  const [customGoal, setCustomGoal] = useState("");

  const handleAddCustomGoal = () => {
    if (customGoal.trim() && !selectedGoals.includes(customGoal.trim())) {
      onAddCustomGoal(customGoal.trim());
      setCustomGoal("");
    }
  };

  return (
    <div>
      <div className="space-y-2 mb-4">
        {commonGoals.map((goal) => (
          <div key={goal} className="flex items-center">
            <input
              type="checkbox"
              id={`goal-${goal}`}
              checked={selectedGoals.includes(goal)}
              onChange={() => onToggleGoal(goal)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded mr-2"
            />
            <label htmlFor={`goal-${goal}`}>{goal}</label>
          </div>
        ))}
      </div>
      
      <div className="flex mt-2">
        <input
          type="text"
          value={customGoal}
          onChange={(e) => setCustomGoal(e.target.value)}
          placeholder="Add your own goal"
          className="border p-2 flex-1 rounded-l"
        />
        <button
          type="button"
          onClick={handleAddCustomGoal}
          className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
          disabled={!customGoal.trim()}
        >
          Add
        </button>
      </div>
      
      {selectedGoals.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium text-sm text-gray-700 mb-2">Your selected goals:</h3>
          <div className="flex flex-wrap gap-2">
            {selectedGoals.map((goal) => (
              <div 
                key={goal} 
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
              >
                {goal}
                <button
                  type="button"
                  onClick={() => onToggleGoal(goal)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
