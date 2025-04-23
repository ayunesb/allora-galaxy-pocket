
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface VaultCardProps {
  id: string;
  title: string;
  description: string;
  impact_score?: number | null;
  is_public?: boolean;
  onRemix: () => void;
}

const VaultCard = ({
  id,
  title,
  description,
  impact_score,
  is_public,
  onRemix,
}: VaultCardProps) => {
  const navigate = useNavigate();
  const [publicChecked, setPublicChecked] = useState(is_public ?? false);

  const handleCardClick = () => {
    navigate(`/vault/strategy-detail/${id}`);
  };

  const handleToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setPublicChecked(e.target.checked);
    await supabase
      .from("strategies")
      .update({ is_public: e.target.checked })
      .eq("id", id);
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="cursor-pointer" onClick={handleCardClick}>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-1">
        <p className="text-sm text-muted-foreground flex-1">{description}</p>
        <p className="text-xs mt-1 text-muted-foreground">
          📈 Impact Score: {impact_score ?? "N/A"}
        </p>
        <div className="flex items-center mt-2">
          <input
            type="checkbox"
            checked={publicChecked}
            onChange={handleToggle}
          />
          <label className="text-sm ml-2">🌍 Share to /vault/public</label>
        </div>
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
