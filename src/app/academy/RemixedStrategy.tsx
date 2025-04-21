
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

interface RemixedStrategyProps {
  title: string;
  author: string;
  onUse: () => void;
}

const RemixedStrategy = ({ title, author, onUse }: RemixedStrategyProps) => {
  return (
    <Card>
      <CardContent className="flex justify-between items-center py-4">
        <div className="flex items-start gap-3">
          <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="font-medium">{title}</p>
            <p className="text-xs text-muted-foreground">Remixed by {author}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onUse}>
          Use
        </Button>
      </CardContent>
    </Card>
  );
};

export default RemixedStrategy;
