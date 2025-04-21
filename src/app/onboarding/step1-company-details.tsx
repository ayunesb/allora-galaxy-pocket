
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardHeader, CardContent, CardFooter } from "@/components/ui/card";

interface Step1Props {
  onNext: () => void;
}

export default function Step1({ onNext }: Step1Props) {
  return (
    <>
      <CardHeader>
        <h2 className="text-2xl font-semibold">Company Details</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input placeholder="Company Name" />
      </CardContent>
      <CardFooter>
        <Button onClick={onNext}>Next</Button>
      </CardFooter>
    </>
  );
}
