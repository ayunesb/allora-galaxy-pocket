
import { supabase } from "@/integrations/supabase/client";

export type ReferralData = {
  referrer_user_id: string;
  referred_user_email: string;
};

export async function createReferral({ referrer_user_id, referred_user_email }: ReferralData) {
  try {
    const { data, error } = await supabase
      .from("referrals")
      .insert({
        referrer_user_id,
        referred_user_email,
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error("Error creating referral:", error);
    return { data: null, error };
  }
}

export async function getReferralByEmail(email: string) {
  try {
    const { data, error } = await supabase
      .from("referrals")
      .select()
      .eq("referred_user_email", email)
      .is("claimed_at", null)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error("Error getting referral:", error);
    return { data: null, error };
  }
}

export async function claimReferral(referred_user_id: string, referral_id: string) {
  try {
    const { data, error } = await supabase
      .from("referrals")
      .update({
        referred_user_id,
        claimed_at: new Date().toISOString(),
      })
      .eq("id", referral_id)
      .is("claimed_at", null)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error("Error claiming referral:", error);
    return { data: null, error };
  }
}
