
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface VaultCardProps {
  id: string;
  title: string;
  description: string;
  onRemix: () => void;
}

const VaultCard = ({ id, title, description, onRemix }: VaultCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/vault/strategy-detail/${id}`);
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader 
        className="cursor-pointer" 
        onClick={handleCardClick}
      >
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-1">
        <p className="text-sm text-muted-foreground flex-1">{description}</p>
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            onRemix();
          }} 
          className="w-full mt-4"
          variant="outline"
        >
          <ArrowUp className="mr-2 h-4 w-4" />
          Remix Strategy
        </Button>
      </CardContent>
    </Card>
  );
};

export default VaultCard;
