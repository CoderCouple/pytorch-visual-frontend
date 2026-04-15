"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LabeledGrid } from "./labeled-grid";
import { OperationArrow } from "./operation-arrow";
import { OperationStep } from "@/types/operations";

interface ReshapeVizProps {
  steps: OperationStep[];
  currentStep: number;
  speed?: number;
}

export function ReshapeViz({ steps, currentStep, speed = 1 }: ReshapeVizProps) {
  const [activeGroup, setActiveGroup] = useState(-1);

  const input = steps[0]?.output as { data: number[] | number[][]; shape: number[] } | undefined;
  const flatStep = steps[1]?.output as { flat: number[] } | undefined;
  const result = steps[2]?.output as { data: number[] | number[][] | number[][][]; shape: number[] } | undefined;

  const inputShape = input?.shape || [];
  const resultShape = result?.shape || [];

  // Figure out how many elements per "group" (row in result)
  const groupSize = resultShape.length >= 2 ? resultShape[resultShape.length - 1] : 0;
  const numGroups = groupSize > 0 ? Math.ceil((flatStep?.flat.length || 0) / groupSize) : 0;

  // Animate through groups
  useEffect(() => {
    if (currentStep < 2 || numGroups === 0) {
      setActiveGroup(-1);
      return;
    }
    setActiveGroup(0);
    const timer = setInterval(() => {
      setActiveGroup((prev) => {
        if (prev >= numGroups - 1) return numGroups; // done
        return prev + 1;
      });
    }, 800 / speed);
    return () => clearInterval(timer);
  }, [currentStep, numGroups, speed]);

  if (steps.length === 0 || !input) return null;

  const groupRange: [number, number] | undefined =
    activeGroup >= 0 && activeGroup < numGroups
      ? [activeGroup * groupSize, (activeGroup + 1) * groupSize]
      : undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-center gap-4">
        {/* Input tensor */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col items-center gap-2"
        >
          <div className="text-sm font-semibold">Input <span className="text-xs text-muted-foreground font-normal">[{inputShape.join("x")}]</span></div>
          <LabeledGrid
            data={input.data}
            shape={inputShape}
            varName="a"
            groupRange={groupRange}
          />
        </motion.div>

        {/* Arrow */}
        <OperationArrow
          label={`Reshape(${resultShape.join(", ")})`}
          visible={currentStep >= 1}
        />

        {/* Result tensor */}
        {currentStep >= 2 && result && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="text-sm font-semibold">Result <span className="text-xs text-muted-foreground font-normal">[{resultShape.join("x")}]</span></div>
            <LabeledGrid
              data={result.data}
              shape={resultShape}
              varName="a"
              groupRange={groupRange}
            />
          </motion.div>
        )}
      </div>

      {/* Info strip */}
      {currentStep >= 1 && flatStep && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mx-auto max-w-xl text-center"
        >
          <div className="text-xs text-muted-foreground mb-2">
            Row-major order: elements are read and placed left-to-right, top-to-bottom
          </div>
          <div className="flex gap-0.5 justify-center flex-wrap">
            {flatStep.flat.map((val, i) => {
              const inGroup = groupRange && i >= groupRange[0] && i < groupRange[1];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-center rounded-sm border font-mono text-xs select-none"
                  style={{
                    width: 32,
                    height: 28,
                    backgroundColor: inGroup ? "#fef2f2" : "#f8fafc",
                    borderColor: inGroup ? "#EE4C2C" : "#e2e8f0",
                    borderWidth: inGroup ? 2 : 1,
                    color: inGroup ? "#EE4C2C" : "#64748b",
                    fontWeight: inGroup ? 600 : 400,
                  }}
                >
                  {val}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
