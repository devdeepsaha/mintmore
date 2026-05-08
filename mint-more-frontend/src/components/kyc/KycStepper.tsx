"use client";

import { cn } from "@/lib/utils/cn";
import { CheckCircle2 } from "lucide-react";

interface Step {
  id: number;
  label: string;
  description: string;
}

const STEPS: Step[] = [
  { id: 1, label: "Basic Info",    description: "Personal details" },
  { id: 2, label: "Identity",      description: "ID document" },
  { id: 3, label: "Address",       description: "Proof of address" },
];

interface KycStepperProps {
  currentStep: number; // 1 | 2 | 3
  completedLevel: number; // 0 | 1 | 2 | 3
}

export function KycStepper({ currentStep, completedLevel }: KycStepperProps) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, index) => {
        const isDone    = completedLevel >= step.id;
        const isActive  = currentStep === step.id;
        const isLocked  = completedLevel < step.id - 1;

        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            {/* Step bubble + label */}
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors",
                isDone
                  ? "bg-success border-success"
                  : isActive
                  ? "bg-primary border-primary"
                  : "bg-canvas border-hairline"
              )}>
                {isDone ? (
                  <CheckCircle2 size={18} className="text-white" />
                ) : (
                  <span className={cn(
                    "text-xs font-semibold",
                    isActive ? "text-on-primary" : "text-muted"
                  )}>
                    {step.id}
                  </span>
                )}
              </div>
              <div className="text-center">
                <p className={cn(
                  "text-xs font-medium",
                  isActive ? "text-ink" : isDone ? "text-success" : "text-muted"
                )}>
                  {step.label}
                </p>
                <p className="text-xs text-muted hidden sm:block">
                  {step.description}
                </p>
              </div>
            </div>

            {/* Connector line */}
            {index < STEPS.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 mx-3 mb-5 transition-colors",
                completedLevel > step.id ? "bg-success" : "bg-hairline"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}