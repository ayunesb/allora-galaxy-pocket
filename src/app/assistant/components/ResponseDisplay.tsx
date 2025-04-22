
import { Card } from "@/components/ui/card";

interface ResponseDisplayProps {
  response: string;
  isLoading: boolean;
}

export function ResponseDisplay({ response, isLoading }: ResponseDisplayProps) {
  if (!response) return null;

  return (
    <Card className="mt-4 p-4 bg-muted/50">
      <pre className="text-sm whitespace-pre-wrap font-mono">
        {isLoading ? (
          <span className="text-muted-foreground">Processing your request...</span>
        ) : (
          response
        )}
      </pre>
    </Card>
  );
}
