import React from "react";
import ErrorFallback from "./ErrorFallback";

/**
 * Generic error boundary. Wrap any subtree with it:
 *
 *   <ErrorBoundary>
 *     <FileCatalogPage />
 *   </ErrorBoundary>
 *
 * Pass a custom `fallback` render-prop if a specific screen needs a
 * different message than the default ErrorFallback page, e.g.:
 *
 *   <ErrorBoundary fallback={(error, reset) => <CustomError error={error} onRetry={reset} />}>
 *
 * Note: error boundaries only catch errors thrown during render, in
 * lifecycle methods, and in constructors of the tree below them. They do
 * NOT catch errors in event handlers, async code, or SSR — handle those
 * with regular try/catch (see the async-error notes at the bottom of
 * ErrorFallback.jsx).
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Send to your logging/monitoring service here, e.g. Sentry.captureException
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }
      return <ErrorFallback error={this.state.error} onRetry={this.reset} />;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
