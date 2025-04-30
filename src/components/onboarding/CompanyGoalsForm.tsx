
import { FormEvent } from "react";
import { GoalsMultiSelect } from "./GoalsMultiSelect";

// Predefined list of business goals
export const COMMON_GOALS = [
  "Increase revenue",
  "Automate lead gen",
  "Launch marketing campaigns",
  "Improve retention",
  "Enhance customer experience",
  "Expand to new markets",
  "Reduce operational costs",
  "Build brand awareness"
];

type CompanyGoalsFormProps = {
  selectedGoals: string[];
  revenueTier: string;
  launchMode: string;
  isLoading: boolean;
  error: string;
  onToggleGoal: (goal: string) => void;
  onAddCustomGoal: (goal: string) => void;
  onRevenueChange: (value: string) => void;
  onLaunchModeChange: (value: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
};

export const CompanyGoalsForm = ({
  selectedGoals,
  revenueTier,
  launchMode,
  isLoading,
  error,
  onToggleGoal,
  onAddCustomGoal,
  onRevenueChange,
  onLaunchModeChange,
  onSubmit,
}: CompanyGoalsFormProps) => {
  return (
    <form onSubmit={onSubmit}>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What are your main business goals?
        </label>
        <GoalsMultiSelect
          selectedGoals={selectedGoals}
          onToggleGoal={onToggleGoal}
          onAddCustomGoal={onAddCustomGoal}
          commonGoals={COMMON_GOALS}
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="revenueTier" className="block text-sm font-medium text-gray-700 mb-1">
          Annual Revenue
        </label>
        <select
          id="revenueTier"
          value={revenueTier}
          onChange={(e) => onRevenueChange(e.target.value)}
          className="border p-2 w-full rounded"
        >
          <option value="">Select your revenue tier</option>
          <option value="Under $100K">Under $100K</option>
          <option value="$100K - $1M">$100K - $1M</option>
          <option value="$1M - $10M">$1M - $10M</option>
          <option value="$10M - $50M">$10M - $50M</option>
          <option value="$50M+">$50M+</option>
        </select>
      </div>
      
      <div className="mb-6">
        <label htmlFor="launchMode" className="block text-sm font-medium text-gray-700 mb-1">
          Launch Strategy
        </label>
        <select
          id="launchMode"
          value={launchMode}
          onChange={(e) => onLaunchModeChange(e.target.value)}
          className="border p-2 w-full rounded"
        >
          <option value="">Select your launch mode</option>
          <option value="Stealth">Stealth mode - building quietly</option>
          <option value="MVP">MVP - launching minimum viable product</option>
          <option value="Growth">Growth mode - scaling existing product</option>
          <option value="Enterprise">Enterprise - serving large customers</option>
        </select>
      </div>
      
      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded w-full"
        disabled={isLoading || selectedGoals.length === 0}
      >
        {isLoading ? "Saving..." : "Finish"}
      </button>
    </form>
  );
};
