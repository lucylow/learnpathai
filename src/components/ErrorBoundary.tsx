import React, { Component, ErrorInfo, ReactNode } from 'react';
import { track } from '@/utils/telemetry';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to telemetry service
    track('error_boundary_caught', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });
    
    console.error('ErrorBoundary caught:', error, errorInfo);
    
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-screen bg-background p-6">
          <Card className="max-w-md w-full border-destructive">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <div>
                  <CardTitle className="text-destructive">Something went wrong</CardTitle>
                  <CardDescription>
                    We've logged this error and will fix it soon
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                An unexpected error occurred. Try reloading the page or go back to the home page.
              </p>
              
              <div className="flex gap-3">
                <Button 
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  Reload Page
                </Button>
                <Button 
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="flex-1"
                >
                  Go Home
                </Button>
              </div>

              {import.meta.env.DEV && this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                    Error details (development only)
                  </summary>
                  <div className="mt-2 space-y-2">
                    <div className="text-xs bg-muted p-3 rounded overflow-auto">
                      <div className="font-semibold text-destructive mb-1">
                        {this.state.error.name}: {this.state.error.message}
                      </div>
                      <pre className="text-xs whitespace-pre-wrap">
                        {this.state.error.stack}
                      </pre>
                    </div>
                    {this.state.errorInfo && (
                      <div className="text-xs bg-muted p-3 rounded overflow-auto">
                        <div className="font-semibold mb-1">Component Stack:</div>
                        <pre className="text-xs whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
