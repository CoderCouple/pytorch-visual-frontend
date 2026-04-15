"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OperationStep } from "@/types/operations";

interface MatmulVizProps {
  steps: OperationStep[];
  currentStep: number;
  speed: number;
}

interface DotProduct {
  row: number;
  col: number;
  row_values: number[];
  col_values: number[];
  products: number[];
  sum: number;
}

// Sub-phases within each dot product computation
type SubPhase = "extract" | "multiply" | "sum" | "done";
const SUB_PHASES: SubPhase[] = ["extract", "multiply", "sum", "done"];

export function MatmulViz({ steps, currentStep, speed }: MatmulVizProps) {
  const [activeDot, setActiveDot] = useState(-1);
  const [subPhase, setSubPhase] = useState<SubPhase>("extract");
  const [allDone, setAllDone] = useState(false);

  const inputA = steps[0]?.output as { data: number[][]; shape: number[] } | undefined;
  const inputB = steps[1]?.output as { data: number[][]; shape: number[] } | undefined;
  const dotStep = steps.find(s => s.title === "Dot Products")?.output as { intermediates: DotProduct[] } | undefined;
  const result = steps.find(s => s.title === "Result")?.output as { data: number[][]; shape: number[] } | undefined;

  const intermediates = dotStep?.intermediates || [];

  // Reset when steps change (new run)
  useEffect(() => {
    setActiveDot(-1);
    setSubPhase("extract");
    setAllDone(false);
  }, [steps]);

  // Start animation when currentStep reaches the dot product step (or last step)
  useEffect(() => {
    if (currentStep < 2 || intermediates.length === 0 || activeDot >= 0) return;
    // Kick off animation
    setActiveDot(0);
    setSubPhase("extract");
  }, [currentStep, intermediates.length, activeDot]);

  // Advance through sub-phases and dot products
  useEffect(() => {
    if (activeDot < 0 || allDone || intermediates.length === 0) return;

    const timer = setTimeout(() => {
      const phaseIdx = SUB_PHASES.indexOf(subPhase);

      if (phaseIdx < SUB_PHASES.length - 1) {
        // Advance to next sub-phase
        setSubPhase(SUB_PHASES[phaseIdx + 1]);
      } else {
        // "done" phase — move to next dot product
        if (activeDot < intermediates.length - 1) {
          setActiveDot(activeDot + 1);
          setSubPhase("extract");
        } else {
          // All dot products completed
          setAllDone(true);
        }
      }
    }, 700 / speed);

    return () => clearTimeout(timer);
  }, [activeDot, subPhase, speed, intermediates.length, allDone]);

  if (!inputA || !inputB) return null;

  const aData = inputA.data as number[][];
  const bData = inputB.data as number[][];
  const aRows = aData.length;
  const aCols = aData[0]?.length || 0;
  const bCols = bData[0]?.length || 0;
  const rRows = aRows;
  const rCols = bCols;

  const currentDot = activeDot >= 0 && activeDot < intermediates.length ? intermediates[activeDot] : null;
  const isAnimating = currentDot != null && !allDone;

  // Build completed cells
  const completed = new Map<string, number>();
  for (let idx = 0; idx < activeDot; idx++) {
    const d = intermediates[idx];
    completed.set(`${d.row}-${d.col}`, d.sum);
  }
  if (currentDot && (subPhase === "done" || allDone)) {
    completed.set(`${currentDot.row}-${currentDot.col}`, currentDot.sum);
  }
  if (allDone && result) {
    const rData = result.data as number[][];
    for (let i = 0; i < rRows; i++)
      for (let j = 0; j < rCols; j++)
        completed.set(`${i}-${j}`, rData[i][j]);
  }

  const cs = 56;

  return (
    <div className="space-y-5">
      {/* Matrices row */}
      <div className="flex flex-wrap items-start justify-center gap-6">
        {/* Matrix A */}
        <div className="flex flex-col items-center gap-1">
          <div className="text-sm font-semibold mb-1">A <span className="text-xs text-muted-foreground font-normal">[{aRows}×{aCols}]</span></div>
          <table className="border-collapse">
            <tbody>
              {aData.map((row, i) => (
                <tr key={i}>
                  {row.map((val, j) => {
                    const isHighlighted = isAnimating && currentDot!.row === i;
                    return (
                      <td key={j} style={{ padding: 0 }}>
                        <motion.div
                          animate={{
                            backgroundColor: isHighlighted ? "#dbeafe" : "#f8fafc",
                            borderColor: isHighlighted ? "#3b82f6" : "#e2e8f0",
                            borderWidth: isHighlighted ? 2 : 1,
                            scale: isHighlighted ? 1.05 : 1,
                          }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center justify-center border font-mono text-sm select-none"
                          style={{ width: cs, height: cs }}
                        >
                          {val}
                        </motion.div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center self-center text-2xl font-bold text-muted-foreground pt-6">×</div>

        {/* Matrix B */}
        <div className="flex flex-col items-center gap-1">
          <div className="text-sm font-semibold mb-1">B <span className="text-xs text-muted-foreground font-normal">[{bData.length}×{bCols}]</span></div>
          <table className="border-collapse">
            <tbody>
              {bData.map((row, i) => (
                <tr key={i}>
                  {row.map((val, j) => {
                    const isHighlighted = isAnimating && currentDot!.col === j;
                    return (
                      <td key={j} style={{ padding: 0 }}>
                        <motion.div
                          animate={{
                            backgroundColor: isHighlighted ? "#dcfce7" : "#f8fafc",
                            borderColor: isHighlighted ? "#22c55e" : "#e2e8f0",
                            borderWidth: isHighlighted ? 2 : 1,
                            scale: isHighlighted ? 1.05 : 1,
                          }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center justify-center border font-mono text-sm select-none"
                          style={{ width: cs, height: cs }}
                        >
                          {val}
                        </motion.div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center self-center text-2xl font-bold text-muted-foreground pt-6">=</div>

        {/* Result Matrix */}
        <div className="flex flex-col items-center gap-1">
          <div className="text-sm font-semibold mb-1">C <span className="text-xs text-muted-foreground font-normal">[{rRows}×{rCols}]</span></div>
          <table className="border-collapse">
            <tbody>
              {Array.from({ length: rRows }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: rCols }).map((_, j) => {
                    const key = `${i}-${j}`;
                    const isDone = completed.has(key);
                    const isActive = isAnimating && currentDot!.row === i && currentDot!.col === j;

                    return (
                      <td key={j} style={{ padding: 0 }}>
                        <motion.div
                          animate={{
                            backgroundColor: isActive ? "#fef2f2" : isDone ? "#f0fdf4" : "#f8fafc",
                            borderColor: isActive ? "#EE4C2C" : isDone ? "#86efac" : "#e2e8f0",
                            borderWidth: isActive ? 3 : 1,
                          }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center justify-center border font-mono text-sm select-none"
                          style={{ width: cs, height: cs }}
                        >
                          {isDone ? (
                            <motion.span
                              key={`val-${completed.get(key)}`}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className={isActive ? "font-bold text-[#EE4C2C]" : "text-emerald-700 font-medium"}
                            >
                              {completed.get(key)}
                            </motion.span>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </motion.div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Computation strip ── */}
      <AnimatePresence mode="wait">
        {isAnimating && currentDot && (
          <motion.div
            key={`${currentDot.row}-${currentDot.col}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto max-w-2xl rounded-xl border-2 border-[#EE4C2C]/20 bg-gradient-to-b from-red-50 to-white p-5 space-y-4"
          >
            {/* Target label */}
            <div className="text-center text-sm font-medium text-muted-foreground">
              Computing <span className="font-mono font-bold text-foreground">C[{currentDot.row},{currentDot.col}]</span>
            </div>

            {/* Extract: numbers fly out */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-6"
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-blue-500 font-medium">row {currentDot.row} of A</span>
                <div className="flex gap-1">
                  {currentDot.row_values.map((v, k) => (
                    <motion.div
                      key={k}
                      initial={{ opacity: 0, x: -20, scale: 0.5 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ delay: k * 0.08, type: "spring", stiffness: 200 }}
                      className="w-10 h-10 flex items-center justify-center rounded-md bg-blue-100 border-2 border-blue-300 font-mono font-bold text-blue-700"
                    >
                      {v}
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="text-lg text-muted-foreground font-bold pt-4">·</div>

              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-emerald-500 font-medium">col {currentDot.col} of B</span>
                <div className="flex gap-1">
                  {currentDot.col_values.map((v, k) => (
                    <motion.div
                      key={k}
                      initial={{ opacity: 0, x: 20, scale: 0.5 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ delay: k * 0.08, type: "spring", stiffness: 200 }}
                      className="w-10 h-10 flex items-center justify-center rounded-md bg-emerald-100 border-2 border-emerald-300 font-mono font-bold text-emerald-700"
                    >
                      {v}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Multiply: show each pair */}
            {(subPhase === "multiply" || subPhase === "sum" || subPhase === "done") && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-3 flex-wrap"
              >
                {currentDot.row_values.map((v, k) => (
                  <motion.div
                    key={k}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: k * 0.1, type: "spring" }}
                    className="flex items-center gap-1"
                  >
                    {k > 0 && <span className="text-muted-foreground font-bold mx-1">+</span>}
                    <span className="font-mono text-blue-600">{v}</span>
                    <span className="text-muted-foreground">×</span>
                    <span className="font-mono text-emerald-600">{currentDot.col_values[k]}</span>
                    <span className="text-muted-foreground">=</span>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: k * 0.1 + 0.08 }}
                      className="font-mono font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded"
                    >
                      {currentDot.products[k]}
                    </motion.span>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Sum: final result */}
            {(subPhase === "sum" || subPhase === "done") && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2"
              >
                <div className="flex items-center gap-1 font-mono">
                  {currentDot.products.map((p, k) => (
                    <span key={k} className="flex items-center gap-1">
                      {k > 0 && <span className="text-muted-foreground">+</span>}
                      <span className="text-orange-600 font-medium">{p}</span>
                    </span>
                  ))}
                </div>
                <motion.div
                  initial={{ scale: 0, x: -10 }}
                  animate={{ scale: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-muted-foreground font-bold">=</span>
                  <span className="inline-flex items-center justify-center min-w-[40px] h-10 rounded-lg bg-[#EE4C2C] text-white font-mono font-bold text-lg px-3">
                    {currentDot.sum}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    → C[{currentDot.row},{currentDot.col}]
                  </span>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress dots */}
      {activeDot >= 0 && (
        <div className="flex items-center justify-center gap-1.5">
          {intermediates.map((d, idx) => (
            <div
              key={idx}
              title={`C[${d.row},${d.col}]`}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                idx < activeDot || (idx === activeDot && (subPhase === "done" || allDone))
                  ? "bg-emerald-400"
                  : idx === activeDot
                    ? "bg-[#EE4C2C] animate-pulse"
                    : "bg-slate-200"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
