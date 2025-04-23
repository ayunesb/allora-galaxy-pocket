
import { supabase } from "@/integrations/supabase/client";

/**
 * Signs up a user, sets their role, and logs the role change
 * Initializes a base trust score for new users
 */
export async function signupUser(email: string, password: string, role: string) {
  // Signup user through Supabase Auth
  const { data: signUpUser, error: signUpError } = await supabase.auth.signUp({
    email,
    password
  });

  if (signUpError || !signUpUser?.user?.id) {
    throw signUpError || new Error("No user returned from sign up");
  }

  // Insert user role with initial trust score
  const { error: roleError } = await supabase.from("user_roles").insert({
    user_id: signUpUser.user.id,
    role,
    trust_score: 10  // Base trust score for new users
  });

  if (roleError) {
    throw roleError;
  }

  // Log initial role assignment
  const { error: logError } = await supabase.from("role_change_logs").insert({
    user_id: signUpUser.user.id,
    changed_by: signUpUser.user.id,  // User sets their initial role
    new_role: role,
    reason: "Initial signup"
  });

  if (logError) {
    console.warn("Could not log role change:", logError);
  }

  return signUpUser;
}
