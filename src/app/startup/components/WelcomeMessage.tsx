
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WelcomeMessageProps {
  message: string;
}

export function WelcomeMessage({ message }: WelcomeMessageProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">👋 AI CEO says:</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}
