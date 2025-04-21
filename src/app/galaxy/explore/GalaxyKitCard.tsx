
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

interface GalaxyKitCardProps {
  title: string;
  description: string;
  onUse: () => void;
}

const GalaxyKitCard = ({ title, description, onUse }: GalaxyKitCardProps) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow">
        <p className="text-muted-foreground flex-grow">{description}</p>
        <Button onClick={onUse} className="w-full mt-4">
          Use Kit
        </Button>
      </CardContent>
    </Card>
  );
};

export default GalaxyKitCard;
