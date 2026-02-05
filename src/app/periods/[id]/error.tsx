"use client";

import { Button } from "@/components/ui/button";

export default function PeriodError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center px-4">
          <span className="text-xl font-bold">ZakatPlanr</span>
        </div>
      </header>
      <main className="container mx-auto flex flex-col items-center justify-center px-4 py-24 text-center">
        <h2 className="text-2xl font-bold">Something went wrong</h2>
        <p className="mt-2 text-muted-foreground">
          Failed to load this period. Please try again.
        </p>
        <Button onClick={reset} className="mt-6">
          Try Again
        </Button>
      </main>
    </div>
  );
}
