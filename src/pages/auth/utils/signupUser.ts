
import { supabase } from "@/integrations/supabase/client";

/**
 * Signs up a user and sets their role in user_roles.
 * Throws an error if unsuccessful.
 */
export async function signupUser(email: string, password: string, role: string) {
  const { data: signUpUser, error: signUpError } = await supabase.auth.signUp({
    email,
    password
  });
  if (signUpError || !signUpUser?.user?.id) {
    throw signUpError || new Error("No user returned from sign up");
  }
  const { error: roleError } = await supabase.from("user_roles").insert({
    user_id: signUpUser.user.id,
    role
  });
  if (roleError) {
    throw roleError;
  }
  return signUpUser;
}
