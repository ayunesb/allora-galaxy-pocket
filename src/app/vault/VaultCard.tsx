
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, BookOpen, Share2 } from 'lucide-react';

interface VaultCardProps {
  id: string;
  title: string;
  description: string;
  impact_score?: number;
  is_public: boolean;
  onRemix: () => void;
}

const VaultCard: React.FC<VaultCardProps> = ({
  id,
  title,
  description,
  impact_score,
  is_public,
  onRemix
}) => {
  return (
    <Card className="overflow-hidden border hover:shadow-md transition-all">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{title}</CardTitle>
          {is_public && (
            <Badge variant="outline" className="border-primary text-primary">
              <Share2 className="h-3 w-3 mr-1" />
              Public
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
          {description}
        </p>
        {impact_score !== undefined && (
          <div className="flex items-center text-sm mb-2">
            <Badge variant="secondary" className="font-medium mr-1">
              <Sparkles className="h-3 w-3 mr-1 text-amber-500" />
              Impact Score
            </Badge>
            <span className="text-muted-foreground">{impact_score}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-muted/50 pt-3 flex justify-between">
        <Button variant="outline" size="sm" className="gap-1">
          <BookOpen className="h-4 w-4" />
          View
        </Button>
        <Button onClick={onRemix} size="sm" className="gap-1">
          <Sparkles className="h-4 w-4" />
          Remix
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VaultCard;
