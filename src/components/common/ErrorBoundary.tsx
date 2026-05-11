/**
 * React Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, RefreshCw, Home, MessageCircle } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// ============================================================================
// Error Boundary Component
// ============================================================================

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error);
    console.error('Component stack:', errorInfo.componentStack);

    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you would send this to an error tracking service
    if (import.meta.env.PROD === true) {
      // Example: Sentry.captureException(error, { extra: errorInfo });
      this.reportError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error state when children change (if resetOnPropsChange is true)
    if (
      this.state.hasError &&
      this.props.resetOnPropsChange &&
      prevProps.children !== this.props.children
    ) {
      this.resetError();
    }
  }

  private reportError(error: Error, errorInfo: ErrorInfo) {
    // Send error to backend logging endpoint
    fetch('/api/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      }),
    }).catch(console.error);
  }

  private resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error fallback UI
      return <ErrorFallback 
        error={this.state.error} 
        onReset={this.resetError}
        onReload={this.handleReload}
        onGoHome={this.handleGoHome}
      />;
    }

    return this.props.children;
  }
}

// ============================================================================
// Error Fallback UI Component
// ============================================================================

interface ErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
  onReload: () => void;
  onGoHome: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  onReset,
  onReload,
  onGoHome,
}) => {
  const isDevelopment = !import.meta.env.PROD;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full bg-white rounded-3xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-red-500 p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <p className="text-slate-600 text-center">
            We apologize for the inconvenience. Our team has been notified and is working to fix the issue.
          </p>

          {/* Error details in development */}
          {isDevelopment && error && (
            <div className="bg-slate-100 rounded-xl p-4 overflow-auto max-h-48">
              <p className="text-sm font-mono text-red-600 mb-2">{error.message}</p>
              <pre className="text-xs text-slate-600 whitespace-pre-wrap">
                {error.stack}
              </pre>
            </div>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={onGoHome}
              className="flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Button>
            <Button
              onClick={onReload}
              className="flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Page
            </Button>
          </div>

          {/* Try again button */}
          <Button
            variant="ghost"
            onClick={onReset}
            className="w-full text-slate-500 hover:text-slate-700"
          >
            Try to recover
          </Button>

          {/* Support link */}
          <div className="text-center pt-4 border-t border-slate-100">
            <a
              href="mailto:support@attngo.org"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Contact Support
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ============================================================================
// Hook for functional components
// ============================================================================

import { useState, useCallback } from 'react';

/**
 * Hook to handle errors in functional components
 * Returns an error state and a function to trigger error
 */
export const useErrorBoundary = () => {
  const [error, setError] = useState<Error | null>(null);

  const throwError = useCallback((error: Error) => {
    setError(error);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  if (error) {
    throw error;
  }

  return { throwError, clearError };
};

// ============================================================================
// Async Error Wrapper
// ============================================================================

/**
 * Higher-order component to catch errors in async operations
 * Usage: withAsyncErrorHandler(MyComponent)
 */
export const withAsyncErrorHandler = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => (
    <ErrorBoundary>
      <Component {...props} />
    </ErrorBoundary>
  );
};

export default ErrorBoundary;
