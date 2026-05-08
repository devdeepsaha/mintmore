import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Briefcase,
  Users,
  Zap,
} from "lucide-react";

export function HeroBand() {
  return (
    <section className="section-padding pt-32 bg-canvas">
      <div className="content-container">
        <div className="grid grid-cols-1 lg:grid-cols-[7fr_5fr] gap-12 lg:gap-16 items-center">
          {/* Left: Copy */}
          <div className="flex flex-col gap-6">
            {/* Badge */}
            <div className="inline-flex">
              <span className="badge-pill bg-surface-card text-ink gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
                AI-powered matching · Now live in India
              </span>
            </div>

            {/* Headline */}
            <h1
              className="text-display-xl text-ink"
              style={{
                fontSize: "clamp(40px, 6vw, 64px)",
                lineHeight: "1.05",
                letterSpacing: "-2px",
                fontWeight: 600,
              }}
            >
              The smarter way to hire freelancers
            </h1>

            {/* Sub-headline */}
            <p className="text-body-md text-muted max-w-lg leading-relaxed">
              Mint More matches clients with the right freelancers through a
              controlled AI engine — no open marketplace noise, no cold
              outreach. Just precise, verified matches.
            </p>

            {/* Trust bullets */}
            <div className="flex flex-col gap-2.5">
              {[
                "KYC-verified freelancers only",
                "Max 2 negotiation rounds — fast decisions",
                "Admin-approved deals for quality assurance",
              ].map((point) => (
                <div key={point} className="flex items-center gap-2.5">
                  <CheckCircle2
                    size={16}
                    className="text-success flex-shrink-0"
                  />
                  <span className="text-body-sm text-body">{point}</span>
                </div>
              ))}
            </div>

            {/* CTA row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2">
              <Link href="/register" className="btn-primary gap-2">
                Post a job free
                <ArrowRight size={14} />
              </Link>
              <Link href="/register?role=freelancer" className="btn-secondary">
                Join as freelancer
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex -space-x-2">
                {["#fb923c", "#ec4899", "#8b5cf6", "#34d399"].map(
                  (color, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-canvas flex items-center justify-center"
                      style={{ backgroundColor: color }}
                    >
                      <span className="text-white text-xs font-semibold">
                        {["R", "P", "A", "S"][i]}
                      </span>
                    </div>
                  )
                )}
              </div>
              <p className="text-body-sm text-muted">
                <span className="font-semibold text-ink">500+</span> verified
                freelancers matched
              </p>
            </div>
          </div>

          {/* Right: Product mockup card */}
          <div
            className="bg-canvas border border-hairline rounded-xl shadow-card p-6 flex flex-col gap-4"
            style={{ borderRadius: "16px" }}
          >
            {/* Mockup header */}
            <div className="flex items-center justify-between">
              <span className="text-title-sm text-ink">Active Match</span>
              <span className="badge-pill bg-success/10 text-success text-xs">
                Live
              </span>
            </div>

            {/* Job card mockup */}
            <div className="bg-surface-card rounded-lg p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-title-sm text-ink">
                    React Native Developer
                  </p>
                  <p className="text-body-sm text-muted mt-0.5">
                    E-commerce mobile app · 3 months
                  </p>
                </div>
                <span className="badge-pill bg-badge-violet/10 text-badge-violet text-xs flex-shrink-0">
                  Expert
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-title-sm text-ink font-semibold">
                  ₹85,000 – ₹1,20,000
                </span>
                <span className="text-caption text-muted">Budget range</span>
              </div>
            </div>

            {/* Match candidates */}
            <div className="flex flex-col gap-2">
              <p className="text-caption text-muted font-medium uppercase tracking-wide">
                Top Matches
              </p>
              {[
                {
                  name: "Arjun Mehta",
                  level: "Experienced",
                  score: 96,
                  color: "#fb923c",
                  tier: "Instant",
                },
                {
                  name: "Priya Sharma",
                  level: "Experienced",
                  score: 89,
                  color: "#ec4899",
                  tier: "+5 min",
                },
                {
                  name: "Rohan Das",
                  level: "Intermediate",
                  score: 81,
                  color: "#8b5cf6",
                  tier: "+10 min",
                },
              ].map((candidate) => (
                <div
                  key={candidate.name}
                  className="flex items-center gap-3 bg-canvas rounded-lg p-3 border border-hairline-soft"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: candidate.color }}
                  >
                    <span className="text-white text-xs font-semibold">
                      {candidate.name[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-caption font-semibold text-ink truncate">
                      {candidate.name}
                    </p>
                    <p className="text-xs text-muted">{candidate.level}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-16 h-1.5 bg-surface-card rounded-full overflow-hidden">
                      <div
                        className="h-full bg-success rounded-full"
                        style={{ width: `${candidate.score}%` }}
                      />
                    </div>
                    <span className="text-caption font-semibold text-ink w-8 text-right">
                      {candidate.score}
                    </span>
                  </div>
                  <span className="text-xs text-muted w-12 text-right flex-shrink-0">
                    {candidate.tier}
                  </span>
                </div>
              ))}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-hairline-soft">
              {[
                { icon: Briefcase, label: "Jobs posted", value: "1.2K" },
                { icon: Users, label: "Freelancers", value: "500+" },
                { icon: Zap, label: "Avg match time", value: "4 min" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <Icon size={14} className="text-muted" />
                  <span className="text-title-sm text-ink font-semibold">
                    {value}
                  </span>
                  <span className="text-xs text-muted text-center leading-tight">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}