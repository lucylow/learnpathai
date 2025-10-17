import React, { Component, ReactNode, ErrorInfo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Send to monitoring service (e.g., Sentry) in production
    if (import.meta.env.PROD) {
      // Example: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-screen bg-background p-6">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="h-8 w-8 text-destructive" />
                <CardTitle className="text-2xl">Something went wrong</CardTitle>
              </div>
              <CardDescription>
                We're sorry, but something unexpected happened. The error has been logged and we'll look into it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {import.meta.env.DEV && this.state.error && (
                <div className="rounded-lg bg-muted p-4 font-mono text-sm overflow-auto">
                  <p className="font-semibold mb-2 text-destructive">{this.state.error.message}</p>
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                    {this.state.error.stack}
                  </pre>
                </div>
              )}
              <div className="flex gap-3">
                <Button onClick={this.handleReset}>
                  Try again
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                  Return to home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

