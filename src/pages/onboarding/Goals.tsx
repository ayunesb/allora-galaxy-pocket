
import { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuthSession } from "../../hooks/useAuthSession";

// Predefined list of business goals
const COMMON_GOALS = [
  "Increase revenue",
  "Automate lead gen",
  "Launch marketing campaigns",
  "Improve retention",
  "Enhance customer experience",
  "Expand to new markets",
  "Reduce operational costs",
  "Build brand awareness"
];

export default function CompanyGoals() {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [customGoal, setCustomGoal] = useState("");
  const [revenueTier, setRevenueTier] = useState("");
  const [launchMode, setLaunchMode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const session = useAuthSession();

  // Load existing goals if any
  useEffect(() => {
    async function fetchCompanyGoals() {
      if (!session?.user?.id) return;
      
      try {
        // Get the user's tenant ID
        const { data: tenantData, error: tenantError } = await supabase
          .from("tenant_user_roles")
          .select("tenant_id")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (tenantError || !tenantData?.tenant_id) {
          console.error("Error fetching tenant:", tenantError);
          return;
        }

        // Fetch company profile data including goals
        const { data: profileData, error: profileError } = await supabase
          .from("company_profiles")
          .select("goals, revenue_tier, launch_mode")
          .eq("tenant_id", tenantData.tenant_id)
          .maybeSingle();

        if (profileError) {
          console.error("Error fetching company goals:", profileError);
          return;
        }

        if (profileData) {
          // Pre-fill form with existing data
          setSelectedGoals(profileData.goals || []);
          setRevenueTier(profileData.revenue_tier || "");
          setLaunchMode(profileData.launch_mode || "");
        }
      } catch (err) {
        console.error("Error loading company goals:", err);
      }
    }

    fetchCompanyGoals();
  }, [session]);

  const toggleGoal = (goal: string) => {
    setSelectedGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal) 
        : [...prev, goal]
    );
  };

  const addCustomGoal = () => {
    if (customGoal.trim() && !selectedGoals.includes(customGoal.trim())) {
      setSelectedGoals(prev => [...prev, customGoal.trim()]);
      setCustomGoal("");
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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

      // Update company_profiles with revenue tier, launch mode and goals
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
            goals: selectedGoals,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingProfile.id);

        if (updateError) {
          throw updateError;
        }
      }

      // Save persona profile with goals
      const personaGoalsText = selectedGoals.join(", ");
      
      // Save goals to persona_profiles table
      const { error: personaError } = await supabase
        .from("persona_profiles")
        .upsert({
          tenant_id: tenantId,
          user_id: session.user.id,
          goal: personaGoalsText
        }, { onConflict: "tenant_id, user_id" });

      if (personaError) {
        throw personaError;
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
          
          <div className="space-y-2 mb-4">
            {COMMON_GOALS.map((goal) => (
              <div key={goal} className="flex items-center">
                <input
                  type="checkbox"
                  id={`goal-${goal}`}
                  checked={selectedGoals.includes(goal)}
                  onChange={() => toggleGoal(goal)}
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
              onClick={addCustomGoal}
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
                      onClick={() => toggleGoal(goal)}
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
          disabled={isLoading || selectedGoals.length === 0}
        >
          {isLoading ? "Saving..." : "Finish"}
        </button>
      </form>
    </div>
  );
}
