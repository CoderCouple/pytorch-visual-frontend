"use client";

import { motion } from "framer-motion";
import { getValueColor, getTextColor } from "@/lib/color-scales";

// Accept any nesting depth
type TensorValue = number | number[] | number[][] | number[][][];

interface TensorGridProps {
  data: TensorValue;
  shape: number[];
  label?: string;
  highlightMask?: boolean[] | boolean[][] | boolean[][][];
  animateIn?: boolean;
}

export function TensorGrid({ data, shape, label, highlightMask, animateIn = true }: TensorGridProps) {
  const ndim = shape.length;

  if (ndim === 0 || shape.some((s) => s === 0)) {
    return (
      <div className="text-xs text-muted-foreground italic">Empty tensor</div>
    );
  }

  // Flatten all values for a shared color scale
  const allValues = flattenDeep(data);

  return (
    <div className="flex flex-col items-center gap-2">
      {label && (
        <div className="text-sm font-semibold text-foreground">{label}</div>
      )}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-mono">
          shape: [{shape.join(", ")}]
        </span>
        <DimBadge ndim={ndim} />
      </div>

      {ndim === 1 && (
        <Grid1D
          data={data as number[]}
          allValues={allValues}
          highlightMask={highlightMask as boolean[] | undefined}
          animateIn={animateIn}
        />
      )}
      {ndim === 2 && (
        <Grid2D
          data={data as number[][]}
          allValues={allValues}
          highlightMask={highlightMask as boolean[][] | undefined}
          animateIn={animateIn}
        />
      )}
      {ndim === 3 && (
        <Grid3D
          data={data as number[][][]}
          allValues={allValues}
          highlightMask={highlightMask as boolean[][][] | undefined}
          animateIn={animateIn}
        />
      )}
      {ndim > 3 && (
        <div className="text-xs text-muted-foreground italic">
          {ndim}D tensor — showing as flattened 2D
        </div>
      )}
    </div>
  );
}

/* ───────── 1D: single horizontal strip with index labels ───────── */

function Grid1D({
  data,
  allValues,
  highlightMask,
  animateIn,
}: {
  data: number[];
  allValues: number[];
  highlightMask?: boolean[];
  animateIn: boolean;
}) {
  const len = data.length;
  const cellSize = getCellSize(1, len);

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Index labels */}
      <div className="flex gap-0.5">
        {data.map((_, j) => (
          <div
            key={j}
            className="text-center text-[9px] text-muted-foreground font-mono"
            style={{ width: cellSize }}
          >
            {j}
          </div>
        ))}
      </div>
      {/* Cells */}
      <div className="flex gap-0.5">
        {data.map((val, j) => (
          <Cell
            key={j}
            value={val}
            allValues={allValues}
            index={`[${j}]`}
            cellSize={cellSize}
            highlighted={highlightMask ? highlightMask[j] : true}
            animateIn={animateIn}
            delay={j * 0.04}
          />
        ))}
      </div>
      {/* Bracket decoration */}
      <div
        className="border-b-2 border-l-2 border-r-2 border-muted-foreground/30 rounded-b-sm"
        style={{ width: len * (cellSize + 2), height: 4 }}
      />
    </div>
  );
}

/* ───────── 2D: labeled grid with row/col indices ───────── */

function Grid2D({
  data,
  allValues,
  highlightMask,
  animateIn,
}: {
  data: number[][];
  allValues: number[];
  highlightMask?: boolean[][];
  animateIn: boolean;
}) {
  const rows = data.length;
  const cols = data[0]?.length || 0;
  const cellSize = getCellSize(rows, cols);

  return (
    <div className="inline-flex flex-col items-center gap-0">
      {/* Column indices */}
      <div className="flex" style={{ paddingLeft: 24 }}>
        {Array.from({ length: cols }).map((_, j) => (
          <div
            key={j}
            className="text-center text-[9px] text-muted-foreground font-mono"
            style={{ width: cellSize + 2 }}
          >
            {j}
          </div>
        ))}
      </div>

      {data.map((row, i) => (
        <div key={i} className="flex items-center gap-0">
          {/* Row index */}
          <div
            className="text-[9px] text-muted-foreground font-mono text-right pr-1"
            style={{ width: 22 }}
          >
            {i}
          </div>
          {/* Row cells */}
          <div className="flex gap-0.5">
            {row.map((val, j) => (
              <Cell
                key={j}
                value={val}
                allValues={allValues}
                index={`[${i}, ${j}]`}
                cellSize={cellSize}
                highlighted={highlightMask ? highlightMask[i]?.[j] : true}
                animateIn={animateIn}
                delay={(i * cols + j) * 0.03}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ───────── 3D: stacked slices with depth labels ───────── */

function Grid3D({
  data,
  allValues,
  highlightMask,
  animateIn,
}: {
  data: number[][][];
  allValues: number[];
  highlightMask?: boolean[][][];
  animateIn: boolean;
}) {
  const depth = data.length;

  return (
    <div className="space-y-3">
      {/* Perspective hint */}
      <div className="text-xs text-muted-foreground text-center">
        {depth} slice{depth !== 1 ? "s" : ""} along dim 0
      </div>
      <div className="flex flex-wrap items-start gap-6 justify-center">
        {data.map((slice, d) => {
          const rows = slice.length;
          const cols = slice[0]?.length || 0;
          const cellSize = getCellSize(rows, cols, depth);

          return (
            <motion.div
              key={d}
              initial={animateIn ? { opacity: 0, y: 15, rotateX: 10 } : false}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: d * 0.12, duration: 0.4 }}
              className="flex flex-col items-center gap-1"
            >
              {/* Depth label */}
              <div className="text-xs font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                [{d}, :, :]
              </div>

              {/* Column indices */}
              <div className="flex" style={{ paddingLeft: 20 }}>
                {Array.from({ length: cols }).map((_, j) => (
                  <div
                    key={j}
                    className="text-center text-[8px] text-muted-foreground font-mono"
                    style={{ width: cellSize + 2 }}
                  >
                    {j}
                  </div>
                ))}
              </div>

              {slice.map((row, i) => (
                <div key={i} className="flex items-center gap-0">
                  <div
                    className="text-[8px] text-muted-foreground font-mono text-right pr-1"
                    style={{ width: 18 }}
                  >
                    {i}
                  </div>
                  <div className="flex gap-0.5">
                    {row.map((val, j) => (
                      <Cell
                        key={j}
                        value={val}
                        allValues={allValues}
                        index={`[${d}, ${i}, ${j}]`}
                        cellSize={cellSize}
                        highlighted={
                          highlightMask ? highlightMask[d]?.[i]?.[j] : true
                        }
                        animateIn={animateIn}
                        delay={d * 0.12 + (i * cols + j) * 0.02}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ───────── Shared Cell component ───────── */

function Cell({
  value,
  allValues,
  index,
  cellSize,
  highlighted,
  animateIn,
  delay,
}: {
  value: number;
  allValues: number[];
  index: string;
  cellSize: number;
  highlighted: boolean;
  animateIn: boolean;
  delay: number;
}) {
  const bg = getValueColor(value, allValues);
  const fg = getTextColor(bg);
  const displayVal = Number.isInteger(value)
    ? value
    : Math.abs(value) < 0.01
      ? value.toExponential(1)
      : value.toFixed(2);

  return (
    <motion.div
      title={`${index} = ${value}`}
      initial={animateIn ? { scale: 0, opacity: 0 } : false}
      animate={{ scale: 1, opacity: highlighted ? 1 : 0.25 }}
      transition={{
        delay: animateIn ? delay : 0,
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
      className="flex items-center justify-center rounded-sm border cursor-default font-mono select-none"
      style={{
        width: cellSize,
        height: cellSize,
        backgroundColor: bg,
        color: fg,
        fontSize: cellSize <= 36 ? "0.55rem" : cellSize <= 44 ? "0.65rem" : "0.75rem",
      }}
    >
      {displayVal}
    </motion.div>
  );
}

/* ───────── Dimension badge ───────── */

function DimBadge({ ndim }: { ndim: number }) {
  const colors: Record<number, string> = {
    1: "bg-emerald-100 text-emerald-700 border-emerald-300",
    2: "bg-blue-100 text-blue-700 border-blue-300",
    3: "bg-purple-100 text-purple-700 border-purple-300",
  };
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${colors[ndim] || "bg-muted text-muted-foreground border-border"}`}
    >
      {ndim}D
    </span>
  );
}

/* ───────── Helpers ───────── */

function getCellSize(rows: number, cols: number, numSlices?: number): number {
  const maxDim = Math.max(rows, cols);
  // Shrink cells when there are multiple 3D slices
  const sliceFactor = numSlices && numSlices > 2 ? 0.8 : 1;
  return Math.round(Math.min(56, Math.max(30, 280 / maxDim)) * sliceFactor);
}

function flattenDeep(val: TensorValue): number[] {
  if (typeof val === "number") return [val];
  return (val as unknown[]).flatMap((v) => flattenDeep(v as TensorValue));
}
