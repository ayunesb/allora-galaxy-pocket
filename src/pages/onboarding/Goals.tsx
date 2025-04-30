
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuthSession } from "../../hooks/useAuthSession";

export default function CompanyGoals() {
  const [goals, setGoals] = useState<string[]>(["", ""]);
  const [revenueTier, setRevenueTier] = useState("");
  const [launchMode, setLaunchMode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const session = useAuthSession();

  const addGoal = () => {
    setGoals([...goals, ""]);
  };

  const updateGoal = (index: number, value: string) => {
    const newGoals = [...goals];
    newGoals[index] = value;
    setGoals(newGoals);
  };

  const removeGoal = (index: number) => {
    if (goals.length > 1) {
      const newGoals = [...goals];
      newGoals.splice(index, 1);
      setGoals(newGoals);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (!session?.user?.id) {
        throw new Error("User not authenticated");
      }

      // Get the user's tenant ID
      const { data: tenantData, error: tenantError } = await supabase
        .from("tenant_user_roles")
        .select("tenant_id")
        .eq("user_id", session.user.id)
        .single();

      if (tenantError) {
        throw new Error("Failed to get tenant information");
      }

      const tenantId = tenantData.tenant_id;

      // Filter out empty goals
      const filteredGoals = goals.filter(goal => goal.trim() !== "");

      // Save goals to persona_profiles table
      const { error: personaError } = await supabase
        .from("persona_profiles")
        .upsert({
          tenant_id: tenantId,
          user_id: session.user.id,
          goal: filteredGoals.join(", ")
        }, { onConflict: "tenant_id, user_id" });

      if (personaError) {
        throw personaError;
      }

      // Update company_profiles with revenue tier and launch mode
      const { data: existingProfile, error: checkError } = await supabase
        .from("company_profiles")
        .select("id")
        .eq("tenant_id", tenantId)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking existing profile:", checkError);
        throw checkError;
      }

      if (existingProfile?.id) {
        const { error: updateError } = await supabase
          .from("company_profiles")
          .update({
            revenue_tier: revenueTier,
            launch_mode: launchMode,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingProfile.id);

        if (updateError) {
          throw updateError;
        }
      }

      // Navigate to dashboard after successful submission
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Error saving goals:", err);
      setError(err.message || "Failed to save goals.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Business Goals</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What are your main business goals?
          </label>
          
          {goals.map((goal, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                value={goal}
                onChange={(e) => updateGoal(index, e.target.value)}
                placeholder={`Goal ${index + 1}`}
                className="border p-2 flex-1 rounded mr-2"
              />
              <button
                type="button"
                onClick={() => removeGoal(index)}
                className="text-red-500 hover:text-red-700"
                disabled={goals.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addGoal}
            className="text-blue-500 hover:text-blue-700 text-sm mt-1"
          >
            + Add another goal
          </button>
        </div>
        
        <div className="mb-4">
          <label htmlFor="revenueTier" className="block text-sm font-medium text-gray-700 mb-1">
            Annual Revenue
          </label>
          <select
            id="revenueTier"
            value={revenueTier}
            onChange={(e) => setRevenueTier(e.target.value)}
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
            onChange={(e) => setLaunchMode(e.target.value)}
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
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Finish"}
        </button>
      </form>
    </div>
  );
}
