
import React from "react";
import { cn } from "@/lib/utils";

interface PocketLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const PocketLayout = ({ children, className }: PocketLayoutProps) => {
  return (
    <div className={cn(
      "min-h-screen w-full bg-background dark:bg-gray-900 text-foreground dark:text-white flex items-center justify-center p-4",
      className
    )}>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
};

export default PocketLayout;
