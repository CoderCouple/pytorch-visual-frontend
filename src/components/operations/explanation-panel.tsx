"use client";

import { motion, AnimatePresence } from "framer-motion";
import { OperationStep } from "@/types/operations";
import { Badge } from "@/components/ui/badge";

interface ExplanationPanelProps {
  steps: OperationStep[];
  currentStep: number;
}

export function ExplanationPanel({ steps, currentStep }: ExplanationPanelProps) {
  if (steps.length === 0) {
    return (
      <div className="rounded-lg border p-4 text-sm text-muted-foreground">
        Run the operation to see step-by-step explanation.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {steps.map((step, i) => (
        <AnimatePresence key={i}>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{
              opacity: i <= currentStep ? 1 : 0.3,
              x: 0,
            }}
            className={`rounded-lg border p-3 transition-colors ${
              i === currentStep ? "border-[#EE4C2C] bg-[#EE4C2C]/5" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${
                  i === currentStep
                    ? "bg-black text-white"
                    : i < currentStep
                      ? "bg-black text-white"
                      : "bg-black/20 text-black"
                }`}
              >
                {i + 1}
              </div>
              <div className="flex flex-col justify-center min-h-[40px]">
                <span className="font-semibold text-sm leading-tight">{step.title}</span>
                <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      ))}
    </div>
  );
}
