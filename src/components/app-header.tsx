import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold">
          ZakatPlanr
        </Link>
        <nav className="flex items-center gap-1">
          <Link href="/snapshot/new">
            <Button variant="ghost" size="sm">
              Update Assets
            </Button>
          </Link>
          <Link href="/hawl">
            <Button variant="ghost" size="sm">
              Hawl History
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
