"use client";

import { motion } from "framer-motion";
import { OperationStep } from "@/types/operations";

interface LossVizProps {
  steps: OperationStep[];
  currentStep: number;
  opId: string;
}

export function LossViz({ steps, currentStep, opId }: LossVizProps) {
  if (opId === "cross_entropy") {
    return <CrossEntropyViz steps={steps} currentStep={currentStep} />;
  }
  return <MSEViz steps={steps} currentStep={currentStep} />;
}

/* ── Cross-Entropy Loss ── */

function CrossEntropyViz({ steps, currentStep }: { steps: OperationStep[]; currentStep: number }) {
  const logitsStep = steps[0]?.output as { data: number[] } | undefined;
  const targetStep = steps[1]?.output as { target: number; num_classes: number } | undefined;
  const probsStep = steps[2]?.output as {
    probabilities: number[];
    class_details: { index: number; logit: number; probability: number; is_target: boolean }[];
  } | undefined;
  const lossStep = steps[3]?.output as { loss: number; target_prob: number } | undefined;

  if (!logitsStep) return null;

  const logits = Array.isArray(logitsStep.data[0]) ? (logitsStep.data as unknown as number[][])[0] : logitsStep.data as number[];
  const maxLogit = Math.max(...logits.map(Math.abs), 1);

  return (
    <div className="space-y-6 w-full max-w-xl mx-auto">
      {/* Logits bars */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
        <div className="text-sm font-semibold">Logits</div>
        <div className="space-y-1">
          {logits.map((val, i) => {
            const isTarget = targetStep?.target === i;
            return (
              <div key={i} className="flex items-center gap-2">
                <span className={`text-xs font-mono w-14 text-right ${isTarget ? "text-[#EE4C2C] font-bold" : "text-muted-foreground"}`}>
                  class {i}{isTarget ? " *" : ""}
                </span>
                <div className="flex-1 h-6 bg-muted rounded-sm relative overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(Math.abs(val) / maxLogit) * 100}%` }}
                    transition={{ delay: i * 0.1 }}
                    className="h-full rounded-sm"
                    style={{
                      backgroundColor: isTarget ? "#EE4C2C" : "#3b82f6",
                      maxWidth: "100%",
                    }}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono">
                    {val.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Probabilities */}
      {currentStep >= 2 && probsStep && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <div className="text-sm font-semibold">Softmax Probabilities</div>
          <div className="space-y-1">
            {probsStep.class_details.map((cls) => (
              <div key={cls.index} className="flex items-center gap-2">
                <span className={`text-xs font-mono w-14 text-right ${cls.is_target ? "text-[#EE4C2C] font-bold" : "text-muted-foreground"}`}>
                  class {cls.index}
                </span>
                <div className="flex-1 h-6 bg-muted rounded-sm relative overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cls.probability * 100}%` }}
                    transition={{ delay: cls.index * 0.1 }}
                    className="h-full rounded-sm"
                    style={{
                      backgroundColor: cls.is_target ? "#EE4C2C" : "#10b981",
                      maxWidth: "100%",
                    }}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono font-medium">
                    {(cls.probability * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Loss value */}
      {currentStep >= 3 && lossStep && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto max-w-sm rounded-xl border-2 border-[#EE4C2C]/30 bg-red-50 p-4 text-center"
        >
          <div className="text-xs text-muted-foreground mb-1">Cross-Entropy Loss</div>
          <div className="font-mono text-lg">
            -log(<span className="text-[#EE4C2C]">{lossStep.target_prob.toFixed(4)}</span>) ={" "}
            <span className="font-bold text-[#EE4C2C]">{lossStep.loss.toFixed(4)}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ── MSE Loss ── */

function MSEViz({ steps, currentStep }: { steps: OperationStep[]; currentStep: number }) {
  const predsStep = steps[0]?.output as { data: number[] } | undefined;
  const targetsStep = steps[1]?.output as { data: number[] } | undefined;
  const diffStep = steps[2]?.output as {
    per_element: { index: number; prediction: number; target: number; diff: number; sq_diff: number }[];
  } | undefined;
  const lossStep = steps[3]?.output as { loss: number } | undefined;

  if (!predsStep || !targetsStep) return null;

  const preds = Array.isArray(predsStep.data[0]) ? (predsStep.data as unknown as number[][])[0] : predsStep.data as number[];
  const targets = Array.isArray(targetsStep.data[0]) ? (targetsStep.data as unknown as number[][])[0] : targetsStep.data as number[];
  const maxVal = Math.max(...preds.map(Math.abs), ...targets.map(Math.abs), 1);

  return (
    <div className="space-y-6 w-full max-w-xl mx-auto">
      {/* Paired bars */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
        <div className="text-sm font-semibold">Predictions vs Targets</div>
        <div className="space-y-2">
          {preds.map((pred, i) => (
            <div key={i} className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono w-10 text-right text-muted-foreground">[{i}]</span>
                <div className="flex-1 space-y-0.5">
                  <div className="h-5 bg-muted rounded-sm relative overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(Math.abs(pred) / maxVal) * 50}%` }}
                      transition={{ delay: i * 0.1 }}
                      className="h-full bg-blue-500 rounded-sm"
                      style={{ maxWidth: "100%" }}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono">
                      pred: {pred.toFixed(2)}
                    </span>
                  </div>
                  {currentStep >= 1 && (
                    <div className="h-5 bg-muted rounded-sm relative overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(Math.abs(targets[i]) / maxVal) * 50}%` }}
                        transition={{ delay: i * 0.1 }}
                        className="h-full bg-emerald-500 rounded-sm"
                        style={{ maxWidth: "100%" }}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono">
                        target: {targets[i].toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground justify-center">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-blue-500" /> Prediction</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-emerald-500" /> Target</div>
        </div>
      </motion.div>

      {/* Squared differences */}
      {currentStep >= 2 && diffStep && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <div className="text-sm font-semibold">Squared Differences</div>
          <div className="flex flex-wrap justify-center gap-3">
            {diffStep.per_element.map((el) => (
              <motion.div
                key={el.index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: el.index * 0.1 }}
                className="rounded-lg border px-3 py-2 text-center bg-amber-50 border-amber-200"
              >
                <div className="text-[10px] text-muted-foreground">[{el.index}]</div>
                <div className="font-mono text-xs">
                  ({el.prediction} - {el.target})²
                </div>
                <div className="font-mono text-sm font-bold text-amber-600">
                  = {el.sq_diff.toFixed(4)}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* MSE value */}
      {currentStep >= 3 && lossStep && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto max-w-sm rounded-xl border-2 border-[#EE4C2C]/30 bg-red-50 p-4 text-center"
        >
          <div className="text-xs text-muted-foreground mb-1">Mean Squared Error</div>
          <div className="font-mono text-lg font-bold text-[#EE4C2C]">
            MSE = {lossStep.loss.toFixed(4)}
          </div>
          {diffStep && (
            <div className="text-xs text-muted-foreground mt-1 font-mono">
              ({diffStep.per_element.map((e) => e.sq_diff.toFixed(4)).join(" + ")}) / {diffStep.per_element.length}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
