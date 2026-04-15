"use client";

import { motion } from "framer-motion";
import { TensorGrid } from "./tensor-grid";
import { OperationArrow } from "./operation-arrow";
import { OperationStep } from "@/types/operations";

interface PermuteVizProps {
  steps: OperationStep[];
  currentStep: number;
}

export function PermuteViz({ steps, currentStep }: PermuteVizProps) {
  const inputStep = steps[0]?.output as { data: number[] | number[][] | number[][][]; shape: number[] } | undefined;
  const axisStep = steps[1]?.output as {
    dims: number[];
    axis_map: Record<string, string>;
    original_shape: number[];
    new_shape: number[];
  } | undefined;
  const resultStep = steps[2]?.output as { data: number[] | number[][] | number[][][]; shape: number[] } | undefined;

  if (steps.length === 0 || !inputStep) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-center gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col items-center gap-2"
        >
          <div className="text-sm font-semibold">
            Input <span className="text-xs text-muted-foreground font-normal">[{inputStep.shape.join("x")}]</span>
          </div>
          <TensorGrid data={inputStep.data} shape={inputStep.shape} />
        </motion.div>

        <OperationArrow
          label={`Permute(${axisStep?.dims?.join(",") || ""})`}
          visible={currentStep >= 1}
        />

        {currentStep >= 2 && resultStep && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="text-sm font-semibold">
              Result <span className="text-xs text-muted-foreground font-normal">[{resultStep.shape.join("x")}]</span>
            </div>
            <TensorGrid data={resultStep.data} shape={resultStep.shape} />
          </motion.div>
        )}
      </div>

      {currentStep >= 1 && axisStep && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-lg"
        >
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {axisStep.dims.map((oldDim, newDim) => (
              <motion.div
                key={newDim}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: newDim * 0.15 }}
                className="flex flex-col items-center gap-1 rounded-lg border-2 border-[#EE4C2C]/30 bg-red-50 px-4 py-2"
              >
                <div className="text-xs text-muted-foreground">dim {newDim}</div>
                <div className="font-mono text-sm font-bold text-[#EE4C2C]">
                  {axisStep.original_shape[oldDim]}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  (was dim {oldDim}: {axisStep.original_shape[oldDim]})
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center text-xs text-muted-foreground mt-3">
            [{axisStep.original_shape.join(", ")}] → [{axisStep.new_shape.join(", ")}]
          </div>
        </motion.div>
      )}
    </div>
  );
}
