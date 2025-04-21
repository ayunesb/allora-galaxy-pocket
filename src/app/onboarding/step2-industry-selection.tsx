
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CardHeader, CardContent, CardFooter } from "@/components/ui/card";

interface Step2Props {
  onNext: () => void;
  onBack: () => void;
}

export default function Step2({ onNext, onBack }: Step2Props) {
  return (
    <>
      <CardHeader>
        <h2 className="text-2xl font-semibold">Select Industry</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an industry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tech">Tech</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="health">Healthcare</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onNext}>Next</Button>
      </CardFooter>
    </>
  );
}
