
import React, { ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DebugErrorBoundaryProps {
  children: ReactNode;
}

interface DebugErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class DebugErrorBoundary extends React.Component<DebugErrorBoundaryProps, DebugErrorBoundaryState> {
  constructor(props: DebugErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): DebugErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Component error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="text-red-500">Something went wrong</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{this.state.error?.message}</p>
            <details className="whitespace-pre-wrap text-sm bg-gray-100 p-4 rounded overflow-auto max-h-96">
              <summary className="cursor-pointer font-medium mb-2">Error details</summary>
              {this.state.errorInfo?.componentStack}
            </details>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
