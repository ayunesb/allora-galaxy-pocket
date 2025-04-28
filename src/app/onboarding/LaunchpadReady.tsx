
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RocketIcon } from "lucide-react";

export default function LaunchpadReady() {
  const navigate = useNavigate();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <RocketIcon className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-3xl">Your AI Launchpad is Ready! 🎉</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground text-lg">
          Your workspace has been customized with strategies and tools tailored to your business type.
        </p>
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">What's Next:</h4>
          <ul className="text-left space-y-2">
            <li>✓ Review your customized growth strategy</li>
            <li>✓ Set up your first campaign</li>
            <li>✓ Track key performance metrics</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button 
          size="lg" 
          onClick={() => navigate("/dashboard")}
          className="w-full md:w-auto"
        >
          Go to Dashboard 🚀
        </Button>
      </CardFooter>
    </Card>
  );
}
