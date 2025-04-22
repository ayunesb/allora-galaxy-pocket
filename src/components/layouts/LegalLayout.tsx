
import { Lock } from "lucide-react";

interface LegalLayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function LegalLayout({ title, children }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="prose prose-sm max-w-none">
          <div className="flex items-center gap-2 mb-8">
            <Lock className="h-5 w-5" />
            <h1 className="text-2xl font-bold m-0">{title}</h1>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
