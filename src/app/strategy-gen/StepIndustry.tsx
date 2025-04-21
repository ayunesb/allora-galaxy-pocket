
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const INDUSTRIES = [
  { value: "SaaS", label: "SaaS" },
  { value: "eCommerce", label: "eCommerce" },
  { value: "Agency", label: "Agency" },
] as const;

export default function StepIndustry({ value, onChange }: { 
  value: string; 
  onChange: (v: string) => void 
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Your Industry</CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select an industry" />
          </SelectTrigger>
          <SelectContent>
            {INDUSTRIES.map((industry) => (
              <SelectItem key={industry.value} value={industry.value}>
                {industry.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
