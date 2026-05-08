import {
  ShieldCheck,
  GitBranch,
  BarChart3,
  Lock,
  Bell,
  BadgeCheck,
} from "lucide-react";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "KYC-Verified Freelancers",
    description:
      "Three-level progressive verification — basic info, identity documents, and address proof. Only verified freelancers enter the matching pool.",
  },
  {
    icon: GitBranch,
    title: "Controlled Negotiation",
    description:
      "Max 2 rounds of structured negotiation per job. Propose, counter, accept or reject — no endless back-and-forth. Backup freelancer activated on failure.",
  },
  {
    icon: BarChart3,
    title: "Market Price Ranges",
    description:
      "Every category comes with admin-set market price ranges. Clients and freelancers enter negotiations with real benchmarks, not guesses.",
  },
  {
    icon: Lock,
    title: "Controlled Visibility",
    description:
      "Freelancers only see jobs they were explicitly matched to. No job board browsing, no spray-and-pray applications. Precision over volume.",
  },
  {
    icon: Bell,
    title: "Real-time SSE Notifications",
    description:
      "Live in-app notifications via Server-Sent Events. Match alerts, negotiation updates, and deal approvals — all instant, no polling.",
  },
  {
    icon: BadgeCheck,
    title: "Admin Approval Gate",
    description:
      "Every user, deal, and KYC submission passes through an admin approval gate before taking effect. Platform quality stays under control.",
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="section-padding bg-surface-soft">
      <div className="content-container">
        {/* Section header */}
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <span className="badge-pill">Platform Features</span>
          <h2
            className="text-ink max-w-2xl"
            style={{
              fontSize: "clamp(28px, 4vw, 48px)",
              fontWeight: 600,
              lineHeight: "1.1",
              letterSpacing: "-1.5px",
            }}
          >
            Built for quality over quantity
          </h2>
          <p className="text-body-md text-muted max-w-xl">
            Every feature in Mint More is designed to keep the signal high and
            the noise out.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="feature-card flex flex-col gap-4">
              <div className="w-10 h-10 rounded-md bg-canvas border border-hairline flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-ink" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-title-md text-ink">{title}</h3>
                <p className="text-body-sm text-muted leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}