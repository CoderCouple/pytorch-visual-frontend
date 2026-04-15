"use client";

import { motion } from "framer-motion";

type GridData = number[] | number[][] | number[][][];

interface LabeledGridProps {
  data: GridData;
  shape: number[];
  /** Variable name for subscript labels, e.g. "a" → a₀₀ */
  varName?: string;
  /** Set of flat indices that are "active" (pink highlight border) */
  activeIndices?: Set<number>;
  /** Group border: array of flat index ranges [start, end) to draw pink border around */
  groupRange?: [number, number];
  /** Show values instead of subscript labels */
  showValues?: boolean;
  animateIn?: boolean;
  /** Override cell size */
  cellSize?: number;
}

export function LabeledGrid({
  data,
  shape,
  varName = "a",
  activeIndices,
  groupRange,
  showValues = false,
  animateIn = true,
  cellSize: cellSizeOverride,
}: LabeledGridProps) {
  const ndim = shape.length;
  const flat = flattenDeep(data);

  if (ndim <= 2) {
    const grid = ndim === 1 ? [flat] : (data as number[][]);
    const rows = grid.length;
    const cols = grid[0]?.length || 0;
    const cs = cellSizeOverride || getCellSize(rows, cols);

    return (
      <div className="flex flex-col items-center gap-1">
        <GridTable
          grid={grid}
          rows={rows}
          cols={cols}
          cellSize={cs}
          varName={varName}
          ndim={ndim}
          activeIndices={activeIndices}
          groupRange={groupRange}
          showValues={showValues}
          animateIn={animateIn}
          depthOffset={0}
        />
      </div>
    );
  }

  // 3D: render slices
  const slices = data as number[][][];
  const rows = slices[0]?.length || 0;
  const cols = slices[0]?.[0]?.length || 0;
  const cs = cellSizeOverride || getCellSize(rows, cols, slices.length);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap items-end gap-6 justify-center">
        {slices.map((slice, d) => {
          const sliceOffset = d * rows * cols;
          return (
            <motion.div
              key={d}
              initial={animateIn ? { opacity: 0, y: 12 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: d * 0.15 }}
              className="flex flex-col items-center gap-1"
            >
              <GridTable
                grid={slice}
                rows={rows}
                cols={cols}
                cellSize={cs}
                varName={varName}
                ndim={3}
                depthIndex={d}
                activeIndices={activeIndices}
                groupRange={groupRange}
                showValues={showValues}
                animateIn={animateIn}
                depthOffset={sliceOffset}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Grid table with pink group borders ── */

function GridTable({
  grid,
  rows,
  cols,
  cellSize,
  varName,
  ndim,
  depthIndex,
  activeIndices,
  groupRange,
  showValues,
  animateIn,
  depthOffset,
}: {
  grid: number[][];
  rows: number;
  cols: number;
  cellSize: number;
  varName: string;
  ndim: number;
  depthIndex?: number;
  activeIndices?: Set<number>;
  groupRange?: [number, number];
  showValues: boolean;
  animateIn: boolean;
  depthOffset: number;
}) {
  return (
    <div className="inline-block">
      <table
        className="border-collapse"
        style={{ borderSpacing: 0 }}
      >
        <tbody>
          {grid.map((row, i) => (
            <tr key={i}>
              {row.map((val, j) => {
                const flatIdx = depthOffset + i * cols + j;
                const isActive = activeIndices?.has(flatIdx) ?? false;
                const inGroup =
                  groupRange != null &&
                  flatIdx >= groupRange[0] &&
                  flatIdx < groupRange[1];

                // Figure out group border edges
                const groupTop = inGroup && (flatIdx - cols < groupRange![0] || i === 0 || flatIdx - cols < depthOffset);
                const groupBottom = inGroup && (flatIdx + cols >= groupRange![1] || i === rows - 1 || flatIdx + cols >= depthOffset + rows * cols);
                const groupLeft = inGroup && (flatIdx - 1 < groupRange![0] || j === 0);
                const groupRight = inGroup && (flatIdx + 1 >= groupRange![1] || j === cols - 1);

                // Build subscript label
                const subscript =
                  ndim === 1
                    ? `${j}`
                    : ndim === 2
                      ? `${i}${j}`
                      : `${depthIndex}${i}${j}`;

                return (
                  <td
                    key={j}
                    className="relative"
                    style={{ padding: 0 }}
                  >
                    <motion.div
                      initial={animateIn ? { opacity: 0, scale: 0.7 } : false}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: animateIn ? flatIdx * 0.025 : 0,
                        type: "spring",
                        stiffness: 300,
                        damping: 22,
                      }}
                      className="flex items-center justify-center border border-slate-200 bg-slate-50 font-serif select-none"
                      style={{
                        width: cellSize,
                        height: cellSize,
                        fontSize: cellSize <= 48 ? "0.8rem" : "0.95rem",
                        // Pink group border
                        borderTopColor: groupTop ? "#EE4C2C" : undefined,
                        borderBottomColor: groupBottom ? "#EE4C2C" : undefined,
                        borderLeftColor: groupLeft ? "#EE4C2C" : undefined,
                        borderRightColor: groupRight ? "#EE4C2C" : undefined,
                        borderTopWidth: groupTop ? 3 : undefined,
                        borderBottomWidth: groupBottom ? 3 : undefined,
                        borderLeftWidth: groupLeft ? 3 : undefined,
                        borderRightWidth: groupRight ? 3 : undefined,
                        backgroundColor: isActive
                          ? "#fde8e8"
                          : inGroup
                            ? "#fef2f2"
                            : "#f8fafc",
                      }}
                    >
                      {showValues ? (
                        <span className="font-mono text-xs font-medium">
                          {Number.isInteger(val) ? val : val.toFixed(2)}
                        </span>
                      ) : (
                        <span>
                          {varName}
                          <sub className="text-[0.65em]">{subscript}</sub>
                        </span>
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
  );
}

/* ── Helpers ── */

function getCellSize(rows: number, cols: number, slices?: number): number {
  const maxDim = Math.max(rows, cols);
  const factor = slices && slices > 2 ? 0.75 : 1;
  return Math.round(Math.min(64, Math.max(40, 280 / maxDim)) * factor);
}

function flattenDeep(val: GridData | number): number[] {
  if (typeof val === "number") return [val];
  return (val as unknown[]).flatMap((v) => flattenDeep(v as GridData | number));
}
