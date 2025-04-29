
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface EmptyStateProps {
  type: 'error' | 'loading' | 'empty';
  error?: Error | null;
  onRetry?: () => void;
}

const EmptyState = ({ type, error, onRetry }: EmptyStateProps) => {
  const navigate = useNavigate();

  if (type === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading recommendations...</p>
        </div>
      </div>
    );
  }

  if (type === 'error') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card className="relative overflow-hidden shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="text-5xl mb-6">🙁</div>
            <h2 className="text-2xl font-bold mb-4">Oops! Something went wrong</h2>
            <p className="mb-6 text-gray-600">
              We couldn't load your recommendations. Please try again later.
            </p>
            <Button onClick={onRetry || (() => window.location.reload())}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card className="relative overflow-hidden shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="text-5xl mb-6">🎉</div>
          <h2 className="text-2xl font-bold mb-4">You're All Caught Up!</h2>
          <p className="mb-6 text-gray-600">
            You've viewed all available recommendations. Check back later for more!
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmptyState;
