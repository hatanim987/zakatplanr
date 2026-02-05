import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold">ZakatPlanr</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold tracking-tight">
            Zakat Made Simple
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Calculate your Zakat and track distributions throughout the year.
          </p>
        </div>

        <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Calculate Zakat</CardTitle>
              <CardDescription>
                Enter your wealth details and let us calculate the Zakat amount
                based on Islamic Shariah.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/calculate">
                <Button className="w-full">Start Calculation</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Track Distributions</CardTitle>
              <CardDescription>
                Already know your amount? Enter it directly and track your
                payments throughout the year.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/periods">
                <Button variant="outline" className="w-full">
                  View Periods
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
