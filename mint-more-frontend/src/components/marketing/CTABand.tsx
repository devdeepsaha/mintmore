import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTABand() {
  return (
    <section className="section-padding bg-canvas">
      <div className="content-container">
        <div
          className="bg-surface-card rounded-lg px-8 py-12 md:py-16 flex flex-col items-center text-center gap-6"
        >
          <span className="badge-pill">Ready to start?</span>

          <h2
            className="text-ink max-w-xl"
            style={{
              fontSize: "clamp(24px, 3.5vw, 36px)",
              fontWeight: 600,
              lineHeight: "1.15",
              letterSpacing: "-1px",
            }}
          >
            Smarter hiring starts with the right match
          </h2>

          <p className="text-body-md text-muted max-w-md">
            Join Mint More and experience controlled freelancer matchmaking. No
            marketplace noise — just precision.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link href="/register" className="btn-primary gap-2">
              Post your first job
              <ArrowRight size={14} />
            </Link>
            <Link href="/register?role=freelancer" className="btn-secondary">
              Join as freelancer
            </Link>
          </div>

          <p className="text-body-sm text-muted">
            Free to start · No credit card required · KYC takes 5 minutes
          </p>
        </div>
      </div>
    </section>
  );
}