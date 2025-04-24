
import React from "react";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTheme } from "@/components/ui/theme-provider";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const OnboardingLayout = ({ children, className }: OnboardingLayoutProps) => {
  const { theme } = useTheme();
  
  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col items-center justify-center bg-background dark:bg-gray-900 p-4 md:p-6">
        <main 
          className={cn("w-full max-w-3xl bg-card shadow-lg rounded-lg p-4 md:p-6 border border-border dark:border-gray-700 dark:bg-gray-800", className)}
          role="main"
          aria-label="Onboarding process"
        >
          {children}
        </main>
      </div>
    </TooltipProvider>
  );
};

export default OnboardingLayout;
