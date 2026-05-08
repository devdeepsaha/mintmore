import {
  ClipboardList,
  Cpu,
  MessageSquare,
  CheckSquare,
  ArrowDown,
} from "lucide-react";

const STEPS = [
  {
    step: "01",
    icon: ClipboardList,
    title: "Client posts a job",
    description:
      "Describe the work, set a budget range, choose pricing mode (Budget or Expert), and publish. The job stays private — no public listing.",
    role: "Client",
    roleColor: "#3b82f6",
  },
  {
    step: "02",
    icon: Cpu,
    title: "AI matching engine runs",
    description:
      "Admin triggers the AI engine. It scores freelancers by skill, availability, rating, and experience level. Top candidates are notified in tiers — instant, +5 min, +10 min.",
    role: "Admin",
    roleColor: "#8b5cf6",
  },
  {
    step: "03",
    icon: MessageSquare,
    title: "Negotiation begins",
    description:
      "The primary matched freelancer initiates negotiation, locking the job. Max 2 rounds: propose → counter → accept or reject. If both freelancers fail, re-matching is triggered.",
    role: "Freelancer",
    roleColor: "#34d399",
  },
  {
    step: "04",
    icon: CheckSquare,
    title: "Deal approved, work starts",
    description:
      "Admin approves the agreed deal. An assignment is created. The freelancer accepts and the job moves to In Progress. Clean, controlled, accountable.",
    role: "Admin + Freelancer",
    roleColor: "#fb923c",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="section-padding bg-canvas">
      <div className="content-container">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 mb-14">
          <span className="badge-pill">The Process</span>
          <h2
            className="text-ink max-w-2xl"
            style={{
              fontSize: "clamp(28px, 4vw, 48px)",
              fontWeight: 600,
              lineHeight: "1.1",
              letterSpacing: "-1.5px",
            }}
          >
            From job post to work in progress
          </h2>
          <p className="text-body-md text-muted max-w-lg">
            A structured 4-step flow that keeps every stakeholder in control.
          </p>
        </div>

        {/* Steps */}
        <div className="flex flex-col max-w-2xl mx-auto gap-0">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.step} className="flex flex-col items-center">
                {/* Step card */}
                <div className="content-card w-full flex gap-5 items-start">
                  {/* Step number + icon */}
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${step.roleColor}18` }}
                    >
                      <Icon
                        size={18}
                        style={{ color: step.roleColor }}
                      />
                    </div>
                    <span
                      className="text-xs font-bold"
                      style={{ color: step.roleColor }}
                    >
                      {step.step}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <h3 className="text-title-md text-ink">{step.title}</h3>
                      <span
                        className="badge-pill text-xs flex-shrink-0"
                        style={{
                          backgroundColor: `${step.roleColor}15`,
                          color: step.roleColor,
                        }}
                      >
                        {step.role}
                      </span>
                    </div>
                    <p className="text-body-sm text-muted leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connector arrow */}
                {index < STEPS.length - 1 && (
                  <div className="flex items-center justify-center py-2">
                    <ArrowDown size={16} className="text-surface-strong" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}