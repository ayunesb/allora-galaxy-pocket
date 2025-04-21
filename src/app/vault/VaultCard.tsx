
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { remix } from "lucide-react";

interface VaultCardProps {
  title: string;
  description: string;
  onRemix: () => void;
}

const VaultCard = ({ title, description, onRemix }: VaultCardProps) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-1">
        <p className="text-sm text-muted-foreground flex-1">{description}</p>
        <Button 
          onClick={onRemix} 
          className="w-full mt-4"
          variant="outline"
        >
          <remix className="mr-2 h-4 w-4" />
          Remix Strategy
        </Button>
      </CardContent>
    </Card>
  );
};

export default VaultCard;
