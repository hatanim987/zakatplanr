import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LandingHeader } from "@/components/landing-header";
import { Calculator, Clock, Scale, CreditCard } from "lucide-react";

const features = [
  {
    icon: Calculator,
    title: "Zakat Calculator",
    description:
      "Calculate your Zakat obligation at 2.5% based on your total zakatable assets including gold, silver, cash, savings, and investments.",
  },
  {
    icon: Clock,
    title: "Hawl Tracker",
    description:
      "Automatically track your Hawl (Islamic lunar year) with Hijri calendar integration. Know exactly when your Zakat becomes due.",
  },
  {
    icon: Scale,
    title: "Nisab Monitoring",
    description:
      "Compare your wealth against the current Nisab threshold based on gold and silver prices. Track whether you meet the minimum for Zakat.",
  },
  {
    icon: CreditCard,
    title: "Payment Tracking",
    description:
      "Record and track your Zakat distributions. See outstanding amounts and payment history across multiple Hawl cycles.",
  },
];

const steps = [
  {
    step: "1",
    title: "Log Your Assets",
    description:
      "Enter your cash, gold, silver, investments, and other zakatable assets. We calculate your total wealth and check it against the Nisab threshold.",
  },
  {
    step: "2",
    title: "Track Your Hawl",
    description:
      "ZakatPlanner automatically tracks your Hawl using the Hijri (Islamic lunar) calendar. You will see a progress ring counting down to your Zakat due date.",
  },
  {
    step: "3",
    title: "Distribute with Confidence",
    description:
      "When Zakat is due, you know exactly how much to pay. Record your payments and track distributions until your obligation is fulfilled.",
  },
];

const faqs = [
  {
    question: "What is Zakat?",
    answer:
      "Zakat is one of the five pillars of Islam. It is an obligatory act of charity requiring Muslims to donate 2.5% of their qualifying wealth annually to those in need. Zakat purifies wealth and helps distribute resources fairly within the community.",
  },
  {
    question: "How is Zakat calculated?",
    answer:
      "Zakat is calculated at 2.5% of your total zakatable wealth, which includes cash, savings, gold, silver, business assets, stocks, and investments, minus any debts or liabilities. Your wealth must exceed the Nisab threshold for Zakat to be obligatory.",
  },
  {
    question: "What is Nisab?",
    answer:
      "Nisab is the minimum amount of wealth a Muslim must possess before Zakat becomes obligatory. It is defined as the value of 7.5 tola (approximately 87.48 grams) of gold or 52.5 tola (approximately 612.36 grams) of silver. The lower of the two values is typically used as the threshold.",
  },
  {
    question: "What is Hawl?",
    answer:
      "Hawl refers to a complete Islamic lunar year (approximately 354 days). For Zakat to become obligatory, your wealth must remain above the Nisab threshold for one full Hawl. If your wealth drops below Nisab during this period, the Hawl resets.",
  },
  {
    question: "Who is eligible to receive Zakat?",
    answer:
      "The Quran (9:60) identifies eight categories of Zakat recipients: the poor (al-fuqara), the needy (al-masakin), Zakat administrators, those whose hearts are to be reconciled, freeing captives, debtors, in the cause of Allah, and the wayfarer (stranded traveller).",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "ZakatPlanner",
  url: "https://zakatplanner.com",
  description:
    "Free Zakat calculator and Hawl tracker based on Islamic Shariah. Calculate Zakat on gold, silver, cash, and investments.",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export default async function LandingPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="min-h-screen bg-background">
        <LandingHeader />

        {/* Hero */}
        <section className="container mx-auto px-4 py-16 text-center md:py-24">
          <Badge variant="secondary" className="mb-4">
            Free Zakat Calculator &amp; Tracker
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Calculate Your Zakat.
            <br />
            Track Your Hawl.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            ZakatPlanner helps you calculate Zakat based on Islamic Shariah,
            track your Hawl (lunar year), monitor Nisab thresholds, and manage
            distributions — all in one place.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/login">
              <Button size="lg">Get Started — It&apos;s Free</Button>
            </Link>
          </div>
        </section>

        <Separator />

        {/* Features */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">
            Everything You Need to Manage Zakat
          </h2>
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* How It Works */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">
            How It Works
          </h2>
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  {step.step}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/login">
              <Button size="lg" variant="outline">
                Start Tracking Your Zakat
              </Button>
            </Link>
          </div>
        </section>

        <Separator />

        {/* FAQ */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">
            Frequently Asked Questions
          </h2>
          <div className="mx-auto max-w-3xl space-y-6">
            {faqs.map((faq) => (
              <Card key={faq.question}>
                <CardHeader>
                  <CardTitle className="text-base">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* Footer */}
        <footer className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ZakatPlanner. Built with care for the Ummah.</p>
        </footer>
      </div>
    </>
  );
}
