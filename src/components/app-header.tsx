import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth, signOut } from "@/auth";

export async function AppHeader() {
  const session = await auth();

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

          {session?.user && (
            <div className="ml-2 flex items-center gap-2">
              {session.user.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt=""
                  className="h-8 w-8 rounded-full"
                />
              )}
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {session.user.name}
              </span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/login" });
                }}
              >
                <Button variant="ghost" size="sm" type="submit">
                  Sign Out
                </Button>
              </form>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
