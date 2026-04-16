"use client";

import { motion } from "framer-motion";
import { OperationStep } from "@/types/operations";

interface AutogradVizProps {
  steps: OperationStep[];
  currentStep: number;
}

interface GraphNode {
  id: string;
  label: string;
  values: number[];
}

interface GraphEdge {
  from: string;
  to: string;
  label: string;
}

export function AutogradViz({ steps, currentStep }: AutogradVizProps) {
  const forwardStep = steps[1]?.output as {
    nodes: GraphNode[];
    edges: GraphEdge[];
    y: number[];
    z: number;
  } | undefined;
  const backwardStep = steps[2]?.output as {
    gradients: number[];
    nodes: GraphNode[];
    edges: GraphEdge[];
  } | undefined;

  if (steps.length === 0) return null;

  const nodes = forwardStep?.nodes || [];
  const edges = forwardStep?.edges || [];
  const showBackward = currentStep >= 2 && backwardStep;

  // Position nodes horizontally
  const nodePositions: Record<string, { x: number; y: number }> = {};
  nodes.forEach((n, i) => {
    nodePositions[n.id] = { x: 80 + i * 200, y: 120 };
  });

  return (
    <div className="space-y-6 w-full">
      <div className="flex justify-center">
        <svg width={Math.max(560, nodes.length * 200)} height={280} className="overflow-visible">
          {/* Edges */}
          {currentStep >= 1 && edges.map((edge, i) => {
            const from = nodePositions[edge.from];
            const to = nodePositions[edge.to];
            if (!from || !to) return null;
            return (
              <g key={`edge-${i}`}>
                {/* Forward arrow (blue) */}
                <motion.line
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: i * 0.3, duration: 0.5 }}
                  x1={from.x + 60}
                  y1={from.y}
                  x2={to.x - 60}
                  y2={to.y}
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  markerEnd="url(#arrow-forward)"
                />
                <motion.text
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.3 + 0.3 }}
                  x={(from.x + to.x) / 2}
                  y={from.y - 20}
                  textAnchor="middle"
                  fontSize={12}
                  fill="#3b82f6"
                  fontWeight="bold"
                >
                  {edge.label}
                </motion.text>

                {/* Backward arrow (orange) */}
                {showBackward && (
                  <>
                    <motion.line
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ delay: (edges.length - i - 1) * 0.3, duration: 0.5 }}
                      x1={to.x - 60}
                      y1={from.y + 40}
                      x2={from.x + 60}
                      y2={to.y + 40}
                      stroke="#f97316"
                      strokeWidth={2.5}
                      strokeDasharray="6 3"
                      markerEnd="url(#arrow-backward)"
                    />
                    <motion.text
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: (edges.length - i - 1) * 0.3 + 0.3 }}
                      x={(from.x + to.x) / 2}
                      y={from.y + 58}
                      textAnchor="middle"
                      fontSize={11}
                      fill="#f97316"
                      fontStyle="italic"
                    >
                      grad
                    </motion.text>
                  </>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node, i) => {
            const pos = nodePositions[node.id];
            if (!pos) return null;
            const isVisible = currentStep >= (i === 0 ? 0 : 1);
            return (
              <motion.g
                key={node.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: isVisible ? 1 : 0.3, scale: isVisible ? 1 : 0.8 }}
                transition={{ delay: i * 0.2 }}
              >
                <rect
                  x={pos.x - 55}
                  y={pos.y - 35}
                  width={110}
                  height={70}
                  rx={12}
                  fill={showBackward && node.id === "x" ? "var(--viz-bg-highlight)" : "var(--viz-bg)"}
                  stroke={showBackward && node.id === "x" ? "#f97316" : "#3b82f6"}
                  strokeWidth={2}
                />
                <text
                  x={pos.x}
                  y={pos.y - 12}
                  textAnchor="middle"
                  fontSize={13}
                  fontWeight="bold"
                  fill="currentColor"
                >
                  {node.label}
                </text>
                <text
                  x={pos.x}
                  y={pos.y + 8}
                  textAnchor="middle"
                  fontSize={11}
                  fill="var(--viz-text-subtle)"
                  fontFamily="monospace"
                >
                  [{node.values.map((v) => v.toFixed(1)).join(", ")}]
                </text>
                {showBackward && node.id === "x" && backwardStep && (
                  <text
                    x={pos.x}
                    y={pos.y + 24}
                    textAnchor="middle"
                    fontSize={11}
                    fill="#f97316"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    grad: [{backwardStep.gradients.map((g) => g.toFixed(1)).join(", ")}]
                  </text>
                )}
              </motion.g>
            );
          })}

          {/* Arrow markers */}
          <defs>
            <marker id="arrow-forward" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="#3b82f6" />
            </marker>
            <marker id="arrow-backward" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="#f97316" />
            </marker>
          </defs>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-0.5 bg-blue-500" />
          <span>Forward pass</span>
        </div>
        {showBackward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1.5"
          >
            <div className="w-6 h-0.5 bg-orange-500 border-dashed" style={{ borderTop: "2px dashed #f97316", height: 0 }} />
            <span>Backward (gradients)</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
