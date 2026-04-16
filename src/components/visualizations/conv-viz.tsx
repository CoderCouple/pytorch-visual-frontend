"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TensorGrid } from "./tensor-grid";
import { OperationArrow } from "./operation-arrow";
import { OperationStep } from "@/types/operations";

interface ConvVizProps {
  steps: OperationStep[];
  currentStep: number;
  speed?: number;
}

export function ConvViz({ steps, currentStep, speed = 1 }: ConvVizProps) {
  const [activeWindow, setActiveWindow] = useState(-1);

  const inputStep = steps[0]?.output as { data: number[][]; shape: number[] } | undefined;
  const kernelStep = steps[1]?.output as { data: number[][]; shape: number[] } | undefined;
  const windowStep = steps[2]?.output as {
    windows: {
      row: number;
      col: number;
      patch: number[][];
      products: number[][];
      sum: number;
    }[];
    output_shape: number[];
  } | undefined;
  const resultStep = steps[3]?.output as { data: number[][]; shape: number[] } | undefined;

  const numWindows = windowStep?.windows?.length || 0;

  useEffect(() => {
    if (currentStep < 2 || numWindows === 0) {
      setActiveWindow(-1);
      return;
    }
    setActiveWindow(0);
    const timer = setInterval(() => {
      setActiveWindow((prev) => {
        if (prev >= numWindows - 1) return numWindows;
        return prev + 1;
      });
    }, 800 / speed);
    return () => clearInterval(timer);
  }, [currentStep, numWindows, speed]);

  if (steps.length === 0 || !inputStep) return null;

  const activeWin =
    activeWindow >= 0 && activeWindow < numWindows
      ? windowStep?.windows[activeWindow]
      : null;

  // Build highlight mask for input based on current window position
  const highlightMask = inputStep.data.map((row, i) =>
    row.map((_, j) => {
      if (!activeWin || !kernelStep) return true;
      const kh = kernelStep.shape[0];
      const kw = kernelStep.shape[1];
      return (
        i >= activeWin.row && i < activeWin.row + kh &&
        j >= activeWin.col && j < activeWin.col + kw
      );
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-center gap-4">
        {/* Input */}
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

        {/* Kernel */}
        {currentStep >= 1 && kernelStep && (
          <>
            <OperationArrow label="* kernel" visible />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="text-sm font-semibold">Kernel</div>
              <TensorGrid data={kernelStep.data} shape={kernelStep.shape} />
            </motion.div>
          </>
        )}

        {/* Result */}
        {currentStep >= 3 && resultStep && (
          <>
            <OperationArrow label="=" visible />
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="text-sm font-semibold">Output</div>
              <TensorGrid data={resultStep.data} shape={resultStep.shape} />
            </motion.div>
          </>
        )}
      </div>

      {/* Window detail */}
      {activeWin && (
        <motion.div
          key={activeWindow}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-md rounded-xl border-2 border-[#EE4C2C]/30 bg-red-50 dark:bg-red-950 p-4"
        >
          <div className="text-xs text-muted-foreground mb-2 text-center">
            Position [{activeWin.row}, {activeWin.col}]
          </div>
          <div className="flex items-center justify-center gap-4">
            {/* Patch */}
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground mb-1">Patch</div>
              <div className="inline-grid gap-0.5" style={{ gridTemplateColumns: `repeat(${activeWin.patch[0]?.length || 1}, 1fr)` }}>
                {activeWin.patch.flat().map((v, i) => (
                  <div key={i} className="w-8 h-8 rounded-sm border bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 flex items-center justify-center text-xs font-mono">
                    {Number.isInteger(v) ? v : v.toFixed(1)}
                  </div>
                ))}
              </div>
            </div>

            <span className="text-lg font-bold text-muted-foreground">×</span>

            {/* Kernel */}
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground mb-1">Kernel</div>
              <div className="inline-grid gap-0.5" style={{ gridTemplateColumns: `repeat(${kernelStep?.shape[1] || 1}, 1fr)` }}>
                {(kernelStep?.data as number[][])?.flat().map((v, i) => (
                  <div key={i} className="w-8 h-8 rounded-sm border bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-xs font-mono">
                    {Number.isInteger(v) ? v : v.toFixed(1)}
                  </div>
                ))}
              </div>
            </div>

            <span className="text-lg font-bold text-muted-foreground">=</span>

            {/* Sum */}
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground mb-1">Sum</div>
              <div className="w-10 h-10 rounded-lg border-2 border-[#EE4C2C] bg-card flex items-center justify-center font-mono font-bold text-[#EE4C2C]">
                {activeWin.sum}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
