
import React from "react";
import { cn } from "@/lib/utils";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const OnboardingLayout = ({ children, className }: OnboardingLayoutProps) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
    <div className={cn("w-full max-w-3xl bg-card shadow-lg rounded-lg p-6", className)}>
      {children}
    </div>
  </div>
);

export default OnboardingLayout;
