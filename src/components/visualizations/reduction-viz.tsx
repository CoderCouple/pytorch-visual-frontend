"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TensorGrid } from "./tensor-grid";
import { OperationArrow } from "./operation-arrow";
import { OperationStep } from "@/types/operations";

interface ReductionVizProps {
  steps: OperationStep[];
  currentStep: number;
  speed?: number;
}

export function ReductionViz({ steps, currentStep, speed = 1 }: ReductionVizProps) {
  const [activeRow, setActiveRow] = useState(-1);

  const inputStep = steps[0]?.output as { data: number[][]; shape: number[] } | undefined;
  const reductionStep = steps[1]?.output as {
    dim: number;
    intermediates: { index: number; values: number[]; sum?: number; mean?: number }[];
    operation: string;
  } | undefined;
  const resultStep = steps[2]?.output as { data: number[]; shape: number[] } | undefined;

  const numGroups = reductionStep?.intermediates?.length || 0;

  useEffect(() => {
    if (currentStep < 1 || numGroups === 0) {
      setActiveRow(-1);
      return;
    }
    setActiveRow(0);
    const timer = setInterval(() => {
      setActiveRow((prev) => {
        if (prev >= numGroups - 1) return numGroups;
        return prev + 1;
      });
    }, 800 / speed);
    return () => clearInterval(timer);
  }, [currentStep, numGroups, speed]);

  if (steps.length === 0 || !inputStep) return null;

  const opName = reductionStep?.operation || "sum";
  const activeIntermediate =
    activeRow >= 0 && activeRow < numGroups
      ? reductionStep?.intermediates[activeRow]
      : null;

  // Build highlight mask for input tensor
  const highlightMask = inputStep.data.map((row, i) =>
    row.map((_, j) => {
      if (!reductionStep || activeRow < 0 || activeRow >= numGroups) return true;
      if (reductionStep.dim === 1) return i === activeRow;
      return j === activeRow;
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-center gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col items-center gap-2"
        >
          <div className="text-sm font-semibold">Input</div>
          <TensorGrid
            data={inputStep.data}
            shape={inputStep.shape}
            highlightMask={highlightMask}
          />
        </motion.div>

        <OperationArrow
          label={opName === "mean" ? "Mean" : "Sum"}
          visible={currentStep >= 1}
        />

        {currentStep >= 2 && resultStep && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="text-sm font-semibold">Result</div>
            <TensorGrid
              data={resultStep.data}
              shape={resultStep.shape}
            />
          </motion.div>
        )}
      </div>

      {activeIntermediate && (
        <motion.div
          key={activeRow}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-md rounded-xl border-2 border-[#EE4C2C]/30 bg-red-50 p-4 text-center"
        >
          <div className="text-xs text-muted-foreground mb-2">
            {reductionStep?.dim === 1 ? `Row ${activeRow}` : `Column ${activeRow}`}
          </div>
          <div className="font-mono text-sm">
            {activeIntermediate.values.map((v, i) => (
              <span key={i}>
                {i > 0 && <span className="text-muted-foreground"> + </span>}
                <span className="text-blue-600">{Number.isInteger(v) ? v : v.toFixed(1)}</span>
              </span>
            ))}
            {opName === "mean" && (
              <span className="text-muted-foreground"> ) / {activeIntermediate.values.length}</span>
            )}
            <span className="text-muted-foreground"> = </span>
            <span className="font-bold text-[#EE4C2C]">
              {(activeIntermediate.sum ?? activeIntermediate.mean ?? 0).toFixed(
                opName === "mean" ? 2 : Number.isInteger(activeIntermediate.sum ?? 0) ? 0 : 2
              )}
            </span>
          </div>
          {opName === "mean" && (
            <div className="text-xs text-muted-foreground mt-1">
              ( {activeIntermediate.values.map((v) => (Number.isInteger(v) ? v : v.toFixed(1))).join(" + ")} ) / {activeIntermediate.values.length}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
