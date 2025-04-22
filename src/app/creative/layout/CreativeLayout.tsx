
import { Card } from "@/components/ui/card"

interface CreativeLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function CreativeLayout({ title, children }: CreativeLayoutProps) {
  return (
    <Card className="bg-white p-4 rounded shadow">
      <h3 className="font-semibold mb-3">{title}</h3>
      {children}
    </Card>
  );
}
