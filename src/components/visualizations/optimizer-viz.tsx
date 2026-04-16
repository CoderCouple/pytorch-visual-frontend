"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { motion } from "framer-motion";
import { OperationStep } from "@/types/operations";

interface OptimizerVizProps {
  steps: OperationStep[];
  currentStep: number;
}

export function OptimizerViz({ steps, currentStep }: OptimizerVizProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const setupStep = steps[0]?.output as { optimizer: string; lr: number; target: number } | undefined;
  const curveStep = steps[1]?.output as { curve: { w: number[]; loss: number[] } } | undefined;
  const trajStep = steps[2]?.output as {
    trajectory: { step: number; w: number; loss: number; grad: number }[];
    curve: { w: number[]; loss: number[] };
  } | undefined;

  const curve = curveStep?.curve || trajStep?.curve;
  const trajectory = trajStep?.trajectory || [];

  useEffect(() => {
    if (!svgRef.current || !curve) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 480;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear()
      .domain(d3.extent(curve.w) as [number, number])
      .range([0, w]);
    const yScale = d3.scaleLinear()
      .domain([0, Math.max(...curve.loss) * 1.1])
      .range([h, 0]);

    // Axes
    g.append("g")
      .attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(xScale).ticks(8))
      .selectAll("text").style("font-size", "10px");
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(6))
      .selectAll("text").style("font-size", "10px");

    // Axis labels
    g.append("text")
      .attr("x", w / 2)
      .attr("y", h + 35)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "var(--viz-text-subtle)")
      .text("w");
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -h / 2)
      .attr("y", -38)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "var(--viz-text-subtle)")
      .text("loss");

    // Loss curve
    const line = d3.line<number>()
      .x((_, i) => xScale(curve.w[i]))
      .y((_, i) => yScale(curve.loss[i]));

    const path = g.append("path")
      .datum(curve.loss)
      .attr("fill", "none")
      .attr("stroke", "#94a3b8")
      .attr("stroke-width", 2)
      .attr("d", line);

    const totalLength = (path.node() as SVGPathElement)?.getTotalLength() || 0;
    path
      .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(600)
      .attr("stroke-dashoffset", 0);

    // Trajectory points and gradient arrows
    if (currentStep >= 2 && trajectory.length > 0) {
      // Connecting line
      const trajLine = d3.line<{ w: number; loss: number }>()
        .x((d) => xScale(d.w))
        .y((d) => yScale(d.loss));

      g.append("path")
        .datum(trajectory)
        .attr("fill", "none")
        .attr("stroke", "#EE4C2C")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "4 2")
        .attr("d", trajLine)
        .attr("opacity", 0)
        .transition()
        .delay(700)
        .duration(500)
        .attr("opacity", 1);

      // Points
      trajectory.forEach((pt, i) => {
        const isLast = i === trajectory.length - 1;

        // Gradient arrow (skip last point)
        if (!isLast && pt.grad !== 0) {
          const arrowLen = Math.min(30, Math.abs(pt.grad) * 5);
          const dir = pt.grad > 0 ? -1 : 1;
          g.append("line")
            .attr("x1", xScale(pt.w))
            .attr("y1", yScale(pt.loss) + 15)
            .attr("x2", xScale(pt.w) + dir * arrowLen)
            .attr("y2", yScale(pt.loss) + 15)
            .attr("stroke", "#f97316")
            .attr("stroke-width", 2)
            .attr("marker-end", "url(#grad-arrow)")
            .attr("opacity", 0)
            .transition()
            .delay(800 + i * 200)
            .duration(300)
            .attr("opacity", 0.8);
        }

        // Point circle
        g.append("circle")
          .attr("cx", xScale(pt.w))
          .attr("cy", yScale(pt.loss))
          .attr("r", 0)
          .attr("fill", isLast ? "#10b981" : "#EE4C2C")
          .attr("stroke", "white")
          .attr("stroke-width", 2)
          .transition()
          .delay(800 + i * 200)
          .duration(300)
          .attr("r", isLast ? 7 : 5);

        // Step label
        g.append("text")
          .attr("x", xScale(pt.w))
          .attr("y", yScale(pt.loss) - 10)
          .attr("text-anchor", "middle")
          .attr("font-size", "9px")
          .attr("fill", "var(--viz-text-subtle)")
          .attr("opacity", 0)
          .text(`s${pt.step}`)
          .transition()
          .delay(800 + i * 200)
          .duration(200)
          .attr("opacity", 1);
      });
    }

    // Arrow marker
    svg.append("defs")
      .append("marker")
      .attr("id", "grad-arrow")
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("refX", 6)
      .attr("refY", 3)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,0 L6,3 L0,6 Z")
      .attr("fill", "#f97316");

  }, [curve, trajectory, currentStep]);

  if (steps.length === 0) return null;

  return (
    <div className="space-y-6 w-full">
      {/* Setup info */}
      {setupStep && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-4 text-sm"
        >
          <span className="px-2 py-1 rounded bg-muted text-muted-foreground font-mono text-xs">
            {setupStep.optimizer}
          </span>
          <span className="text-muted-foreground">
            lr = {setupStep.lr}
          </span>
          <span className="text-muted-foreground">
            target: w = {setupStep.target}
          </span>
        </motion.div>
      )}

      {/* SVG chart */}
      <div className="flex justify-center">
        <div className="rounded-lg border bg-card p-2">
          <svg ref={svgRef} />
        </div>
      </div>

      {/* Trajectory table */}
      {currentStep >= 2 && trajectory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-md"
        >
          <table className="w-full text-xs font-mono border-collapse">
            <thead>
              <tr className="text-muted-foreground">
                <th className="py-1 px-2 text-left">Step</th>
                <th className="py-1 px-2 text-right">w</th>
                <th className="py-1 px-2 text-right">Loss</th>
                <th className="py-1 px-2 text-right">Grad</th>
              </tr>
            </thead>
            <tbody>
              {trajectory.map((pt, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.08 }}
                  className={i === trajectory.length - 1 ? "font-bold text-emerald-600" : ""}
                >
                  <td className="py-0.5 px-2">{pt.step}</td>
                  <td className="py-0.5 px-2 text-right">{pt.w.toFixed(4)}</td>
                  <td className="py-0.5 px-2 text-right">{pt.loss.toFixed(4)}</td>
                  <td className="py-0.5 px-2 text-right">{pt.grad.toFixed(4)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#EE4C2C]" />
          <span>Optimization steps</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>Final position</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-orange-500" />
          <span>Gradient direction</span>
        </div>
      </div>
    </div>
  );
}
