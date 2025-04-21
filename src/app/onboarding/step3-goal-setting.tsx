
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CardHeader, CardContent, CardFooter } from "@/components/ui/card";

interface Step3Props {
  onBack: () => void;
}

export default function Step3({ onBack }: Step3Props) {
  return (
    <>
      <CardHeader>
        <h2 className="text-2xl font-semibold">Set Goals</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea placeholder="Describe your business goals..." className="min-h-[150px]" />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button variant="default">Finish</Button>
      </CardFooter>
    </>
  );
}
