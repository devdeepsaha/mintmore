import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "For freelancers getting started on the platform.",
    features: [
      "Profile + KYC verification",
      "Receive matched job notifications",
      "Up to 2 active negotiations",
      "Basic support",
    ],
    cta: "Get started free",
    href: "/register?role=freelancer",
    featured: false,
  },
  {
    name: "Client",
    price: "₹999",
    period: "/month",
    description: "For clients posting jobs and managing assignments.",
    features: [
      "Unlimited job postings",
      "AI-powered matching engine",
      "Admin-approved deal flow",
      "Real-time notifications",
      "Market price guidance",
      "Priority support",
    ],
    cta: "Start hiring",
    href: "/register?role=client",
    featured: true,
  },
  {
    name: "Expert",
    price: "₹499",
    period: "/month",
    description: "For experienced freelancers who want expert-mode jobs.",
    features: [
      "Everything in Starter",
      "Expert-mode job access",
      "Priority matching tier",
      "Profile badge",
      "Dedicated account review",
    ],
    cta: "Upgrade to Expert",
    href: "/register?role=freelancer&plan=expert",
    featured: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="section-padding bg-canvas">
      <div className="content-container">
        {/* Head */}
        <div className="max-w-[480px] mb-12">
          <p className="text-caption text-muted uppercase tracking-wider mb-3">
            Pricing
          </p>
          <h2
            className="text-[36px] font-semibold text-ink leading-[1.15] mb-4"
            style={{ letterSpacing: "-1px" }}
          >
            Simple, honest pricing.
          </h2>
          <p className="text-body-md text-muted">
            No commission cuts on deals. No hidden fees. Pay for the platform,
            keep what you earn.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "rounded-lg p-8 flex flex-col",
                plan.featured
                  ? "bg-surface-dark text-on-dark"
                  : "bg-canvas border border-hairline shadow-subtle"
              )}
            >
              {/* Plan name */}
              <div className="mb-6">
                <h3
                  className={cn(
                    "text-title-lg mb-1",
                    plan.featured ? "text-on-dark" : "text-ink"
                  )}
                >
                  {plan.name}
                </h3>
                <p
                  className={cn(
                    "text-body-sm",
                    plan.featured ? "text-on-dark-soft" : "text-muted"
                  )}
                >
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span
                  className={cn(
                    "text-[28px] font-semibold leading-none",
                    plan.featured ? "text-on-dark" : "text-ink"
                  )}
                  style={{ letterSpacing: "-0.5px" }}
                >
                  {plan.price}
                </span>
                {plan.period && (
                  <span
                    className={cn(
                      "text-body-sm ml-1",
                      plan.featured ? "text-on-dark-soft" : "text-muted"
                    )}
                  >
                    {plan.period}
                  </span>
                )}
              </div>

              {/* Features */}
              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check
                      size={14}
                      className={cn(
                        "mt-0.5 flex-shrink-0",
                        plan.featured ? "text-on-dark-soft" : "text-success"
                      )}
                    />
                    <span
                      className={cn(
                        "text-body-sm",
                        plan.featured ? "text-on-dark-soft" : "text-muted"
                      )}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.href}
                className={cn(
                  "text-center py-2.5 px-5 rounded-md text-button font-semibold transition-colors",
                  plan.featured
                    ? "bg-on-dark text-surface-dark hover:bg-on-dark-soft"
                    : "bg-primary text-on-primary"
                )}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}