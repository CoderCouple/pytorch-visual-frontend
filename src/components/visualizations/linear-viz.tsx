"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TensorGrid } from "./tensor-grid";
import { OperationArrow } from "./operation-arrow";
import { OperationStep } from "@/types/operations";

interface LinearVizProps {
  steps: OperationStep[];
  currentStep: number;
  speed?: number;
}

export function LinearViz({ steps, currentStep, speed = 1 }: LinearVizProps) {
  const [activeDot, setActiveDot] = useState(-1);

  const inputStep = steps[0]?.output as { data: number[]; shape: number[] } | undefined;
  const weightStep = steps[1]?.output as { data: number[][]; shape: number[] } | undefined;
  const biasStep = steps[2]?.output as { data: number[]; shape: number[] } | undefined;
  const dotStep = steps[3]?.output as {
    intermediates: {
      output_idx: number;
      weights: number[];
      products: number[];
      dot: number;
      bias: number;
      final: number;
    }[];
  } | undefined;
  const resultStep = steps[4]?.output as { data: number[]; shape: number[] } | undefined;

  const numDots = dotStep?.intermediates?.length || 0;

  useEffect(() => {
    if (currentStep < 3 || numDots === 0) {
      setActiveDot(-1);
      return;
    }
    setActiveDot(0);
    const timer = setInterval(() => {
      setActiveDot((prev) => {
        if (prev >= numDots - 1) return numDots;
        return prev + 1;
      });
    }, 1200 / speed);
    return () => clearInterval(timer);
  }, [currentStep, numDots, speed]);

  if (steps.length === 0 || !inputStep) return null;

  const activeInter =
    activeDot >= 0 && activeDot < numDots
      ? dotStep?.intermediates[activeDot]
      : null;

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
          <TensorGrid data={inputStep.data} shape={inputStep.shape} />
        </motion.div>

        {/* Weight */}
        {currentStep >= 1 && weightStep && (
          <>
            <OperationArrow label="× W^T" visible />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="text-sm font-semibold">Weight</div>
              <TensorGrid data={weightStep.data} shape={weightStep.shape} />
            </motion.div>
          </>
        )}

        {/* Bias */}
        {currentStep >= 2 && biasStep && (
          <>
            <OperationArrow label="+ b" visible />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="text-sm font-semibold">Bias</div>
              <TensorGrid data={biasStep.data} shape={biasStep.shape} />
            </motion.div>
          </>
        )}

        {/* Result */}
        {currentStep >= 4 && resultStep && (
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

      {/* Dot product detail */}
      {activeInter && (
        <motion.div
          key={activeDot}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-lg rounded-xl border-2 border-[#EE4C2C]/30 bg-red-50 dark:bg-red-950 p-4"
        >
          <div className="text-xs text-muted-foreground mb-2 text-center">
            Output neuron {activeInter.output_idx}
          </div>
          <div className="font-mono text-sm text-center space-y-1">
            <div>
              dot = {activeInter.products.map((p, i) => (
                <span key={i}>
                  {i > 0 && " + "}
                  <span className="text-blue-600">{p.toFixed(2)}</span>
                </span>
              ))} = <span className="font-bold">{activeInter.dot.toFixed(4)}</span>
            </div>
            <div>
              <span className="font-bold">{activeInter.dot.toFixed(4)}</span>
              {" + "}
              <span className="text-emerald-600">{activeInter.bias.toFixed(4)}</span>
              {" = "}
              <span className="font-bold text-[#EE4C2C]">{activeInter.final.toFixed(4)}</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
