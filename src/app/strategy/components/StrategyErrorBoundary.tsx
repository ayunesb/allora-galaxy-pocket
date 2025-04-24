
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class StrategyErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Strategy component error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto py-8 px-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-6 rounded-lg">
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="mb-4">
              There was an error loading the strategy data. This could be due to a network issue or a problem with the strategy record.
            </p>
            <div className="font-mono text-sm bg-red-100 p-2 rounded mb-4 max-h-40 overflow-y-auto">
              {this.state.error?.message || "Unknown error"}
            </div>
            <Button onClick={this.handleReload} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
