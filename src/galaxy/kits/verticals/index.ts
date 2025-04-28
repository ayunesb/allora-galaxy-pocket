
import { saasKit } from "./saasKit";
import { ecommerceKit } from "./ecommerceKit";
import { coachingKit } from "./coachingKit";
import { IndustryKit } from "@/types/galaxy";

// Map industry types to kits for easy lookup
export const industryToKitMap: Record<string, IndustryKit> = {
  "tech": saasKit,
  "ecommerce": ecommerceKit,
  "education": coachingKit,
  // Default to SaaS for other industries for now
  "default": saasKit
};

// Get kit by industry type
export const getKitByIndustry = (industry: string): IndustryKit => {
  return industryToKitMap[industry] || industryToKitMap.default;
};

// Export all kits
export const verticalKits = {
  saasKit,
  ecommerceKit,
  coachingKit
};

export { saasKit, ecommerceKit, coachingKit };
