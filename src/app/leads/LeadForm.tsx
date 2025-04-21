
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lead } from "@/types/lead";
import { useToast } from "@/hooks/use-toast";

interface LeadFormProps {
  onAdd: (lead: Omit<Lead, "id" | "createdAt">) => void;
}

export default function LeadForm({ onAdd }: LeadFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!name || !email) {
      toast({
        title: "Validation error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    onAdd({
      name,
      email,
      status: "MQL"
    });
    
    toast({
      title: "Lead added",
      description: "New lead has been successfully added",
    });
    
    setName("");
    setEmail("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Lead</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input 
          placeholder="Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
        />
        <Input 
          type="email"
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <Button 
          onClick={handleSubmit} 
          className="w-full"
          disabled={!name || !email}
        >
          Add Lead
        </Button>
      </CardContent>
    </Card>
  );
}
