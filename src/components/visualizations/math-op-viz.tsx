"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LabeledGrid } from "./labeled-grid";
import { OperationArrow } from "./operation-arrow";
import { OperationStep } from "@/types/operations";

interface MathOpVizProps {
  steps: OperationStep[];
  currentStep: number;
  speed?: number;
}

export function MathOpViz({ steps, currentStep, speed = 1 }: MathOpVizProps) {
  const [activeCell, setActiveCell] = useState(-1);

  const inputA = steps[0]?.output as { data: number[][]; shape: number[] } | undefined;
  const inputB = steps[1]?.output as { data: number[][]; shape: number[] } | undefined;
  const resultStep = steps[steps.length - 1];
  const result = resultStep?.output as { data: number[][]; shape: number[] } | undefined;

  const totalCells = inputA
    ? (inputA.data as number[][]).flat().length
    : 0;

  // Element-by-element animation
  useEffect(() => {
    if (currentStep < steps.length - 1 || !result) {
      setActiveCell(-1);
      return;
    }
    setActiveCell(0);
    const timer = setInterval(() => {
      setActiveCell((prev) => {
        if (prev >= totalCells - 1) {
          clearInterval(timer);
          return totalCells; // done
        }
        return prev + 1;
      });
    }, 400 / speed);
    return () => clearInterval(timer);
  }, [currentStep, totalCells, speed, result, steps.length]);

  if (steps.length === 0 || !inputA || !inputB) return null;

  const aFlat = (inputA.data as number[][]).flat();
  const bFlat = (inputB.data as number[][]).flat();
  const rFlat = result ? (result.data as number[][]).flat() : [];
  const activeACell = activeCell >= 0 && activeCell < totalCells ? activeCell : -1;

  return (
    <div className="space-y-6">
      {/* Main layout: A + B → Result */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        {/* Input A */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col items-center gap-2"
        >
          <div className="text-sm font-semibold">A</div>
          <LabeledGrid
            data={inputA.data as number[][]}
            shape={inputA.shape}
            varName="a"
            showValues
            activeIndices={activeACell >= 0 ? new Set([activeACell]) : undefined}
          />
        </motion.div>

        {/* Plus sign */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: currentStep >= 1 ? 1 : 0, scale: currentStep >= 1 ? 1 : 0 }}
          className="text-3xl font-bold text-[#EE4C2C] mx-2"
        >
          +
        </motion.div>

        {/* Input B */}
        {currentStep >= 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="text-sm font-semibold">B</div>
            <LabeledGrid
              data={inputB.data as number[][]}
              shape={inputB.shape}
              varName="b"
              showValues
              activeIndices={activeACell >= 0 ? new Set([activeACell]) : undefined}
            />
          </motion.div>
        )}

        {/* Arrow */}
        <OperationArrow label="Add" visible={currentStep >= steps.length - 1} />

        {/* Result */}
        {currentStep >= steps.length - 1 && result && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="text-sm font-semibold">Result</div>
            <LabeledGrid
              data={result.data as number[][]}
              shape={result.shape}
              varName="c"
              showValues
              activeIndices={activeACell >= 0 ? new Set([activeACell]) : undefined}
            />
          </motion.div>
        )}
      </div>

      {/* Element-by-element detail strip */}
      {activeACell >= 0 && activeACell < totalCells && (
        <motion.div
          key={activeACell}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-md rounded-xl border-2 border-[#EE4C2C]/30 bg-red-50 p-4 text-center"
        >
          <div className="font-mono text-lg">
            <span className="text-blue-600">{aFlat[activeACell]}</span>
            {" + "}
            <span className="text-emerald-600">{bFlat[activeACell]}</span>
            {" = "}
            <span className="font-bold text-[#EE4C2C]">{rFlat[activeACell]}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1 font-mono">
            a[{Math.floor(activeACell / (inputA.shape[1] || 1))},{activeACell % (inputA.shape[1] || 1)}]
            {" + "}
            b[{Math.floor(activeACell / (inputB.shape[1] || 1))},{activeACell % (inputB.shape[1] || 1)}]
          </div>
        </motion.div>
      )}
    </div>
  );
}
