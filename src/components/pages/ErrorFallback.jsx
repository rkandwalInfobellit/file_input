import React from "react";
import { AlertTriangle, RefreshCw, Home, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Default fallback screen for ErrorBoundary. Kept as its own component so it
 * can also be used standalone, e.g. as a route's errorElement in
 * react-router:
 *
 *   { path: "/", errorElement: <ErrorFallback />, ... }
 *
 * In that case `error` comes from useRouteError() instead of props — see
 * the commented alternate export at the bottom of this file.
 */
export default function ErrorFallback({ error, onRetry }) {
  const [copied, setCopied] = React.useState(false);
  const message = error?.message || "Something went wrong.";
  const stack = error?.stack;

  const copyDetails = async () => {
    try {
      await navigator.clipboard.writeText(
        `${message}\n\n${stack || ""}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard not available — ignore */
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground font-sans px-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle size={26} className="text-destructive" />
        </div>

        <h1 className="text-2xl font-extrabold mb-2">
          Something went wrong
        </h1>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          An unexpected error occurred while rendering this page. You can try
          again, or head back to the dashboard. If this keeps happening,
          share the error details below with support.
        </p>

        <div className="flex items-center justify-center gap-3 mb-6">
          <Button onClick={onRetry} className="gap-1.5 font-semibold">
            <RefreshCw size={15} />
            Try again
          </Button>
          <Button
            variant="outline"
            className="gap-1.5 font-semibold"
            onClick={() => (window.location.href = "/")}
          >
            <Home size={15} />
            Go to dashboard
          </Button>
        </div>

        <details className="text-left rounded-md border bg-card p-3.5 group">
          <summary className="text-xs font-semibold cursor-pointer select-none text-muted-foreground">
            Error details
          </summary>
          <div className="mt-3">
            <div className="flex items-start justify-between gap-2">
              <pre className="text-xs font-mono whitespace-pre-wrap break-words text-destructive flex-1">
                {message}
              </pre>
              <button
                type="button"
                onClick={copyDetails}
                className="shrink-0 text-muted-foreground hover:text-foreground"
                title="Copy error details"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            {stack && (
              <pre className="mt-2 text-[10px] font-mono whitespace-pre-wrap break-words text-muted-foreground max-h-40 overflow-y-auto">
                {stack}
              </pre>
            )}
          </div>
        </details>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// react-router variant — use this instead if you want a route-level
// errorElement rather than (or in addition to) the component-tree
// ErrorBoundary. react-router calls useRouteError() to get the thrown error,
// and errors thrown in loaders/actions/async code land here too, which a
// React error boundary alone cannot catch.
// ---------------------------------------------------------------------------
//
// import { useRouteError, useNavigate } from "react-router-dom";
//
// export function RouteErrorFallback() {
//   const error = useRouteError();
//   const navigate = useNavigate();
//   return <ErrorFallback error={error} onRetry={() => navigate(0)} />;
// }
