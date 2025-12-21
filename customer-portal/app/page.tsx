import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuickQuote } from '@/components/marketing/QuickQuote';
import { ValuePropositions } from '@/components/marketing/ValuePropositions';
import { StatsSection } from '@/components/marketing/StatsSection';
import { HowItWorks } from '@/components/marketing/HowItWorks';
import { Testimonials } from '@/components/marketing/Testimonials';
import FleetShowcase from '@/components/FleetShowcase';

export default function HomePage() {
  return (
    <div className="relative bg-background min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background via-muted/30 to-background py-20 lg:py-32 overflow-hidden">
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-6 max-w-7xl relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Value Proposition */}
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-8 border border-primary/20">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                <span className="text-sm font-semibold text-primary">Trusted by 12,000+ Customers</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-foreground leading-[1.1] mb-6">
                Logistics That{' '}
                <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-500 bg-clip-text text-transparent">
                  Works for You
                </span>
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed mb-10 max-w-xl">
                Professional moving and freight services with transparent pricing, real-time tracking, and white-glove care.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button asChild size="lg" className="h-14 px-8 text-lg font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                  <Link href="/book">Start Your Quote <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg font-semibold border-2 hover:bg-muted/50">
                  <Link href="/track">Track Shipment</Link>
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 border-2 border-background" />
                    ))}
                  </div>
                  <span className="text-muted-foreground font-medium">50,000+ Deliveries</span>
                </div>
                <div className="text-muted-foreground">•</div>
                <div className="text-muted-foreground font-medium">99% On-Time Rate</div>
                <div className="text-muted-foreground">•</div>
                <div className="text-muted-foreground font-medium">Fully Insured</div>
              </div>
            </div>

            {/* Right: Quick Quote Widget */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-20"></div>
              <div className="relative">
                <QuickQuote />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* Value Propositions */}
      <ValuePropositions />

      {/* How It Works */}
      <HowItWorks />

      {/* Testimonials */}
      <Testimonials />

      {/* Fleet Showcase */}
      <div className="bg-gray-50 dark:bg-slate-950/50">
        <FleetShowcase />
      </div>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary to-cyan-600">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Move Smarter?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of satisfied customers and experience logistics done right.
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="h-16 px-12 text-lg font-bold shadow-2xl hover:scale-105 transition-transform"
          >
            <Link href="/book">
              Get Your Free Quote Now
              <ArrowRight className="ml-3 h-6 w-6" />
            </Link>
          </Button>
          <p className="text-white/80 text-sm mt-6">No credit card required • Instant pricing • Book in minutes</p>
        </div>
      </section>
    </div>
  );
}