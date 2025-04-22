
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class StrategyErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Strategy Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <StrategyErrorMessage error={this.state.error} />;
    }

    return this.props.children;
  }
}

function StrategyErrorMessage({ error }: { error?: Error }) {
  const navigate = useNavigate();
  const { id } = useParams();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle className="text-lg font-semibold">Strategy Error</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-4">There was an error loading strategy {id}.</p>
          <p className="text-sm font-mono bg-black/10 p-2 rounded mb-4">
            {error?.message || 'Unknown error occurred'}
          </p>
          <div className="flex gap-4 mt-4">
            <Button 
              variant="default"
              onClick={() => navigate("/strategy")}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Strategies
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
