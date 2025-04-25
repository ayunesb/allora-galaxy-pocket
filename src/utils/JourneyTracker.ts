
import { useSystemLogs } from "@/hooks/useSystemLogs";
import { ToastService } from "@/services/ToastService";

/**
 * JourneyTracker utility for monitoring and validating user progression
 * through the essential user journey: Auth → Onboarding → Strategy → Campaign → Execution → KPI
 */
export class JourneyTracker {
  private static journeySteps = [
    'auth',
    'onboarding',
    'strategy',
    'campaign',
    'execution',
    'kpi'
  ];
  
  /**
   * Track a user's journey step transition
   */
  static async trackStepTransition(
    from: string, 
    to: string, 
    details: Record<string, any> = {},
    logActivity: Function
  ) {
    try {
      return await logActivity({
        event_type: 'USER_JOURNEY',
        message: `User navigated from ${from} to ${to}`,
        meta: {
          journey_step: { from, to },
          ...details
        }
      });
    } catch (error) {
      console.error("Failed to track journey step:", error);
    }
  }
  
  /**
   * Validate if a user can proceed to the next step
   */
  static validateStepTransition(
    from: string, 
    to: string,
    requirements: Record<string, any> = {}
  ): boolean {
    const fromIndex = this.journeySteps.indexOf(from.toLowerCase());
    const toIndex = this.journeySteps.indexOf(to.toLowerCase());
    
    // Unknown steps
    if (fromIndex === -1 || toIndex === -1) {
      return true;
    }
    
    // Check for skipping steps (jumping ahead more than one step)
    if (toIndex > fromIndex + 1) {
      // Make sure all required data for the step is present
      const missingRequirements = Object.entries(requirements)
        .filter(([key, value]) => !value)
        .map(([key]) => key);
      
      if (missingRequirements.length > 0) {
        ToastService.warning({
          title: "Missing requirements",
          description: `Cannot proceed: missing ${missingRequirements.join(', ')}`
        });
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Show guidance toast for the next step in the journey
   */
  static showNextStepGuidance(currentStep: string) {
    const currentIndex = this.journeySteps.indexOf(currentStep.toLowerCase());
    if (currentIndex === -1 || currentIndex >= this.journeySteps.length - 1) return;
    
    const nextStep = this.journeySteps[currentIndex + 1];
    
    const guidanceMessages: Record<string, { title: string, description: string }> = {
      'auth': {
        title: "Welcome!",
        description: "Complete your account setup in the onboarding process."
      },
      'onboarding': {
        title: "Next: Create a strategy",
        description: "Define your marketing strategy to get started."
      },
      'strategy': {
        title: "Next: Build campaigns",
        description: "Create campaigns based on your approved strategy."
      },
      'campaign': {
        title: "Next: Execute campaigns",
        description: "Start executing your campaigns to reach your audience."
      },
      'execution': {
        title: "Next: Track performance",
        description: "Monitor KPIs to measure your campaign success."
      }
    };
    
    const message = guidanceMessages[currentStep];
    if (message) {
      ToastService.info({
        title: message.title,
        description: message.description,
        duration: 8000 // Show longer for guidance
      });
    }
  }
}
