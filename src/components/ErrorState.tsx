import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: Error | string;
  onRetry?: () => void;
  showHomeButton?: boolean;
  showBackButton?: boolean;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  error,
  onRetry,
  showHomeButton = false,
  showBackButton = false,
  className = '',
}) => {
  const navigate = useNavigate();

  const errorMessage = message || (error instanceof Error ? error.message : error) || 'An unexpected error occurred';

  return (
    <Card className={`p-8 sm:p-12 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center text-center max-w-md mx-auto"
      >
        {/* Error Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="mb-6"
        >
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
        </motion.div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
          {title}
        </h3>

        {/* Error Message */}
        <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-sm">
          {errorMessage}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {onRetry && (
            <Button
              onClick={onRetry}
              size="lg"
              className="w-full sm:w-auto"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
          {showBackButton && (
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          )}
          {showHomeButton && (
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          )}
        </div>
      </motion.div>
    </Card>
  );
};

// Inline error alert (for forms, sections)
export const ErrorAlert: React.FC<{
  title?: string;
  message: string;
  onDismiss?: () => void;
}> = ({ title = 'Error', message, onDismiss }) => (
  <Alert variant="destructive" className="mb-4">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>{title}</AlertTitle>
    <AlertDescription className="flex items-start justify-between gap-4">
      <span>{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-sm underline hover:no-underline shrink-0"
          aria-label="Dismiss error"
        >
          Dismiss
        </button>
      )}
    </AlertDescription>
  </Alert>
);

// Network error
export const NetworkError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <ErrorState
    title="Connection Error"
    message="Unable to connect to the server. Please check your internet connection and try again."
    onRetry={onRetry}
    showHomeButton
  />
);

// Not found error
export const NotFoundError: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <ErrorState
      title="Page Not Found"
      message="The page you're looking for doesn't exist or has been moved."
      showHomeButton
      onRetry={() => navigate(-1)}
    />
  );
};

// Permission error
export const PermissionError: React.FC = () => (
  <ErrorState
    title="Access Denied"
    message="You don't have permission to access this resource."
    showHomeButton
    showBackButton
  />
);

// API error
export const APIError: React.FC<{
  statusCode?: number;
  message?: string;
  onRetry?: () => void;
}> = ({ statusCode, message, onRetry }) => {
  let title = 'API Error';
  let description = message || 'An error occurred while communicating with the server';

  if (statusCode === 404) {
    title = 'Not Found';
    description = 'The requested resource was not found';
  } else if (statusCode === 403) {
    title = 'Forbidden';
    description = 'You do not have permission to access this resource';
  } else if (statusCode === 401) {
    title = 'Unauthorized';
    description = 'Please sign in to continue';
  } else if (statusCode && statusCode >= 500) {
    title = 'Server Error';
    description = 'The server encountered an error. Please try again later';
  }

  return (
    <ErrorState
      title={title}
      message={description}
      onRetry={onRetry}
      showHomeButton={statusCode === 404 || statusCode === 403}
    />
  );
};

