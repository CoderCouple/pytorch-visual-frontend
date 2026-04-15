"use client";

import { motion } from "framer-motion";
import { OperationStep } from "@/types/operations";

interface SoftmaxVizProps {
  steps: OperationStep[];
  currentStep: number;
}

export function SoftmaxViz({ steps, currentStep }: SoftmaxVizProps) {
  const logitsStep = steps[0]?.output as { data: number[]; shape: number[] } | undefined;
  const expStep = steps[1]?.output as { exp_values: number[]; exp_sum: number } | undefined;
  const normStep = steps[2]?.output as {
    probabilities: number[];
    labels: string[];
    logits: number[];
    exp_values: number[];
  } | undefined;

  if (steps.length === 0 || !logitsStep) return null;

  const logits = Array.isArray(logitsStep.data[0]) ? (logitsStep.data as unknown as number[][])[0] : logitsStep.data as number[];
  const maxLogit = Math.max(...logits.map(Math.abs), 1);
  const maxExp = expStep ? Math.max(...expStep.exp_values) : 1;
  const barWidth = 200;

  return (
    <div className="space-y-8 w-full max-w-2xl mx-auto">
      {/* Logits */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-2"
      >
        <div className="text-sm font-semibold">Logits (raw scores)</div>
        <div className="space-y-1.5">
          {logits.map((val, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs font-mono w-16 text-right text-muted-foreground">class_{i}</span>
              <div className="flex-1 h-7 bg-muted rounded-sm relative overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(Math.abs(val) / maxLogit) * 100}%` }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="h-full rounded-sm"
                  style={{ backgroundColor: val >= 0 ? "#3b82f6" : "#94a3b8", maxWidth: "100%" }}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono font-medium">
                  {val.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Exponentiate */}
      {currentStep >= 1 && expStep && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="text-sm font-semibold">
            e<sup>x</sup> values
            <span className="text-xs text-muted-foreground font-normal ml-2">
              (sum = {expStep.exp_sum.toFixed(2)})
            </span>
          </div>
          <div className="space-y-1.5">
            {expStep.exp_values.map((val, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs font-mono w-16 text-right text-muted-foreground">e^{logits[i].toFixed(1)}</span>
                <div className="flex-1 h-7 bg-muted rounded-sm relative overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(val / maxExp) * 100}%` }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    className="h-full bg-amber-500 rounded-sm"
                    style={{ maxWidth: "100%" }}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono font-medium">
                    {val.toFixed(3)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Probabilities */}
      {currentStep >= 2 && normStep && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="text-sm font-semibold">Probabilities (normalized)</div>
          <div className="space-y-1.5">
            {normStep.probabilities.map((prob, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs font-mono w-16 text-right text-muted-foreground">
                  {normStep.labels[i]}
                </span>
                <div className="flex-1 h-7 bg-muted rounded-sm relative overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${prob * 100}%` }}
                    transition={{ delay: i * 0.15, duration: 0.5 }}
                    className="h-full bg-emerald-500 rounded-sm"
                    style={{ maxWidth: "100%" }}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono font-bold">
                    {(prob * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-xs text-muted-foreground text-center mt-1">
            Sum = {normStep.probabilities.reduce((a, b) => a + b, 0).toFixed(4)}
          </div>
        </motion.div>
      )}
    </div>
  );
}
