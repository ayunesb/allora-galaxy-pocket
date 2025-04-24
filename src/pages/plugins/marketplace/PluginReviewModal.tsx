
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { Plugin } from "../types";

interface PluginReviewModalProps {
  open: boolean;
  plugin: Plugin | null;
  rating: number;
  setRating: (n: number) => void;
  review: string;
  setReview: (s: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}
export function PluginReviewModal({
  open,
  plugin,
  rating,
  setRating,
  review,
  setReview,
  onClose,
  onSubmit
}: PluginReviewModalProps) {
  if (!open || !plugin) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md p-6 bg-card dark:bg-gray-800 border border-border dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-foreground dark:text-white">Review {plugin.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            {[1,2,3,4,5].map((num) => (
              <Star 
                key={num} 
                className={`w-6 h-6 cursor-pointer ${
                  num <= rating ? "text-yellow-500" : "text-gray-300 dark:text-gray-600"
                }`}
                onClick={() => setRating(num)}
              />
            ))}
            <span className="text-sm text-foreground dark:text-white">{rating} / 5</span>
          </div>
          <textarea 
            placeholder="Write your review..." 
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="w-full border rounded p-2 mb-4 bg-background dark:bg-gray-900 text-foreground dark:text-white border-border dark:border-gray-700"
            rows={4}
          />
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              className="text-foreground dark:text-white border-border dark:border-gray-700"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              onClick={onSubmit}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Submit Review
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

