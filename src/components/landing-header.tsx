import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingHeader() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <span className="text-xl font-bold">ZakatPlanner</span>
        <Link href="/login">
          <Button variant="outline" size="sm">
            Sign In
          </Button>
        </Link>
      </div>
    </header>
  );
}
