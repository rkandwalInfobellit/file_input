import React from "react";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Route-not-found page. Different from ErrorFallback: this is an expected
 * state (bad URL), not a caught runtime error — so no error boundary is
 * involved. Wire it as your router's catch-all:
 *
 *   { path: "*", element: <NotFoundPage /> }
 */
export default function NotFoundPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground font-sans px-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 w-14 h-14 rounded-full bg-muted flex items-center justify-center">
          <FileQuestion size={26} className="text-muted-foreground" />
        </div>

        <div className="text-sm font-bold tracking-wider text-primary mb-2">
          404
        </div>
        <h1 className="text-2xl font-extrabold mb-2">Page not found</h1>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          The page you're looking for doesn't exist or may have been moved.
          Check the URL, or head back to a known page.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            className="gap-1.5 font-semibold"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={15} />
            Go back
          </Button>
          <Button
            className="gap-1.5 font-semibold"
            onClick={() => (window.location.href = "/")}
          >
            <Home size={15} />
            Go to dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
