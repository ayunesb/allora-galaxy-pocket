
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useStrategySystem } from '@/hooks/useStrategySystem';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface StrategyFeedbackFormProps {
  strategyId: string;
  onFeedbackSubmitted?: () => void;
}

export function StrategyFeedbackForm({ strategyId, onFeedbackSubmitted }: StrategyFeedbackFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const { addFeedback, isLoading } = useStrategySystem();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addFeedback({
      strategyId,
      feedback: {
        rating,
        comment,
        isPublic
      }
    }, {
      onSuccess: () => {
        setComment('');
        setRating(0);
        if (onFeedbackSubmitted) onFeedbackSubmitted();
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Strategy Feedback</CardTitle>
        <CardDescription>
          Share your thoughts on this strategy's effectiveness
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rating" className="block mb-2">
                Rating
              </Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant={rating === value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRating(value)}
                  >
                    {value}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <Label htmlFor="comment" className="block mb-2">
                Comments
              </Label>
              <Textarea
                id="comment"
                placeholder="What worked well or needs improvement?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full resize-none"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="public-feedback"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
              <Label htmlFor="public-feedback">Share feedback with team</Label>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            type="submit"
            disabled={rating === 0 || !comment || isLoading}
          >
            {isLoading ? "Submitting..." : "Submit Feedback"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
