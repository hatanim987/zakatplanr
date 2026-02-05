import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PeriodNotFound() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link href="/" className="text-xl font-bold">
            ZakatPlanr
          </Link>
        </div>
      </header>
      <main className="container mx-auto flex flex-col items-center justify-center px-4 py-24 text-center">
        <h2 className="text-2xl font-bold">Period Not Found</h2>
        <p className="mt-2 text-muted-foreground">
          The Zakat period you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/periods" className="mt-6">
          <Button>Back to Periods</Button>
        </Link>
      </main>
    </div>
  );
}
