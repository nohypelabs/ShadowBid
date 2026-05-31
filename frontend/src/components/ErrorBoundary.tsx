import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="sb-error-boundary">
          <div className="sb-error-boundary__card">
            <div className="sb-error-boundary__icon">
              <AlertTriangle size={28} color="#ef4444" />
            </div>
            <h2 className="sb-error-boundary__title">Something went wrong</h2>
            <p className="sb-error-boundary__desc">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <div className="sb-error-boundary__actions">
              <button onClick={this.handleRetry} className="btn-primary sb-error-boundary__btn">
                <RefreshCw size={16} />
                Try Again
              </button>
              <Link to="/" className="btn-ghost sb-error-boundary__btn">
                <Home size={16} />
                Go Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple error fallback for contract read failures
export function ContractErrorFallback({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="sb-contract-error">
      <div className="sb-contract-error__icon">
        <AlertTriangle size={18} color="#ef4444" />
      </div>
      <div className="sb-contract-error__content">
        <p className="sb-contract-error__title">Failed to load data</p>
        <p className="sb-contract-error__detail">{error}</p>
        <button onClick={onRetry} className="sb-contract-error__retry">
          <RefreshCw size={12} /> Retry
        </button>
      </div>
    </div>
  );
}
