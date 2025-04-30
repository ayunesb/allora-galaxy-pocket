
import { useAuthSession } from "../../hooks/useAuthSession";
import { useCompanyGoals } from "../../hooks/useCompanyGoals";
import { CompanyGoalsForm } from "../../components/onboarding/CompanyGoalsForm";

export default function CompanyGoals() {
  const session = useAuthSession();
  const {
    selectedGoals,
    revenueTier,
    launchMode,
    isLoading,
    error,
    toggleGoal,
    addCustomGoal,
    setRevenueTier,
    setLaunchMode,
    handleSubmit,
  } = useCompanyGoals(session);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Business Goals</h1>
      
      <CompanyGoalsForm
        selectedGoals={selectedGoals}
        revenueTier={revenueTier}
        launchMode={launchMode}
        isLoading={isLoading}
        error={error}
        onToggleGoal={toggleGoal}
        onAddCustomGoal={addCustomGoal}
        onRevenueChange={setRevenueTier}
        onLaunchModeChange={setLaunchMode}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
