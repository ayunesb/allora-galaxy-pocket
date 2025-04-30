
import { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuthSession } from "../../hooks/useAuthSession";

export default function CompanyInfo() {
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const session = useAuthSession();

  // Fetch existing company profile data on component load
  useEffect(() => {
    async function fetchCompanyProfile() {
      if (!session?.user?.id) return;
      
      try {
        // Get the user's tenant ID
        const { data: tenantData, error: tenantError } = await supabase
          .from("tenant_user_roles")
          .select("tenant_id")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (tenantError) {
          console.error("Error fetching tenant:", tenantError);
          return;
        }

        if (!tenantData?.tenant_id) return;

        // Fetch company profile data
        const { data: profileData, error: profileError } = await supabase
          .from("company_profiles")
          .select("name, industry, team_size")
          .eq("tenant_id", tenantData.tenant_id)
          .maybeSingle();

        if (profileError) {
          console.error("Error fetching company profile:", profileError);
          return;
        }

        if (profileData) {
          // Pre-fill the form with existing data
          setCompanyName(profileData.name || "");
          setIndustry(profileData.industry || "");
          setTeamSize(profileData.team_size || "");
        }
      } catch (err) {
        console.error("Error loading company data:", err);
      }
    }

    fetchCompanyProfile();
  }, [session]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (!session?.user?.id) {
        throw new Error("User not authenticated");
      }

      // First, create or get tenant profile
      const { data: tenantData, error: tenantError } = await supabase
        .from("tenant_user_roles")
        .select("tenant_id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      let tenantId;

      if (tenantError) {
        console.error("Error checking tenant:", tenantError);
      }

      if (!tenantData?.tenant_id) {
        // Create new tenant profile
        const { data: newTenant, error: createTenantError } = await supabase
          .from("tenant_profiles")
          .insert({
            name: companyName,
            // Using tenant_id as the id column seems to be the existing pattern
          })
          .select("id")
          .single();

        if (createTenantError) {
          throw new Error("Failed to create tenant profile");
        }

        tenantId = newTenant.id;

        // Create tenant user role linking user as owner
        const { error: roleError } = await supabase
          .from("tenant_user_roles")
          .insert({
            user_id: session.user.id,
            tenant_id: tenantId,
            role: "owner"
          });

        if (roleError) {
          throw new Error("Failed to set user role");
        }
      } else {
        tenantId = tenantData.tenant_id;
      }

      // Check if company profile already exists for this tenant
      const { data: existingProfile, error: checkError } = await supabase
        .from("company_profiles")
        .select("id")
        .eq("tenant_id", tenantId)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking existing profile:", checkError);
      }

      let saveError;
      if (existingProfile?.id) {
        // Update existing profile
        const { error } = await supabase
          .from("company_profiles")
          .update({
            name: companyName,
            industry,
            team_size: teamSize,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingProfile.id);
        saveError = error;
      } else {
        // Create new profile
        const { error } = await supabase
          .from("company_profiles")
          .insert({
            tenant_id: tenantId,
            name: companyName,
            industry,
            team_size: teamSize,
          });
        saveError = error;
      }

      if (saveError) {
        throw saveError;
      }

      // Navigate to the next step
      navigate("/onboarding/goals");
    } catch (err: any) {
      console.error("Error saving company info:", err);
      setError(err.message || "Failed to save company information.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Tell us about your company</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
            Company Name
          </label>
          <input
            id="companyName"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="border p-2 w-full rounded"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
            Industry
          </label>
          <select
            id="industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="border p-2 w-full rounded"
            required
          >
            <option value="">Select your industry</option>
            <option value="Technology">Technology</option>
            <option value="Finance">Finance</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Education">Education</option>
            <option value="Retail">Retail</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div className="mb-6">
          <label htmlFor="teamSize" className="block text-sm font-medium text-gray-700 mb-1">
            Team Size
          </label>
          <select
            id="teamSize"
            value={teamSize}
            onChange={(e) => setTeamSize(e.target.value)}
            className="border p-2 w-full rounded"
            required
          >
            <option value="">Select your team size</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-500">201-500 employees</option>
            <option value="501+">501+ employees</option>
          </select>
        </div>
        
        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded w-full"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Next"}
        </button>
      </form>
    </div>
  );
}
