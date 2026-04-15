"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { motion } from "framer-motion";
import { TensorGrid } from "./tensor-grid";
import { OperationStep } from "@/types/operations";

interface ActivationVizProps {
  steps: OperationStep[];
  currentStep: number;
}

export function ActivationViz({ steps, currentStep }: ActivationVizProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const inputStep = steps[0]?.output as { data: number[][]; shape: number[] } | undefined;
  const activationStep = steps[1]?.output as {
    result: { data: number[][]; shape: number[] };
    curve: { x: number[]; y: number[] };
    points: { x: number[]; y: number[] };
  } | undefined;

  useEffect(() => {
    if (!svgRef.current || !activationStep?.curve) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 360;
    const height = 240;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const { x: curveX, y: curveY } = activationStep.curve;

    const xScale = d3.scaleLinear().domain(d3.extent(curveX) as [number, number]).range([0, w]);
    const yScale = d3.scaleLinear().domain([
      Math.min(d3.min(curveY) as number, -1),
      Math.max(d3.max(curveY) as number, 1),
    ]).range([h, 0]);

    // Axes
    g.append("g").attr("transform", `translate(0,${h})`).call(d3.axisBottom(xScale).ticks(5))
      .selectAll("text").style("font-size", "10px");
    g.append("g").call(d3.axisLeft(yScale).ticks(5))
      .selectAll("text").style("font-size", "10px");

    // Zero lines
    g.append("line").attr("x1", 0).attr("x2", w).attr("y1", yScale(0)).attr("y2", yScale(0))
      .attr("stroke", "#ddd").attr("stroke-dasharray", "4");
    g.append("line").attr("x1", xScale(0)).attr("x2", xScale(0)).attr("y1", 0).attr("y2", h)
      .attr("stroke", "#ddd").attr("stroke-dasharray", "4");

    // Curve
    const line = d3.line<number>()
      .x((_, i) => xScale(curveX[i]))
      .y((_, i) => yScale(curveY[i]));

    const path = g.append("path")
      .datum(curveY)
      .attr("fill", "none")
      .attr("stroke", "#EE4C2C")
      .attr("stroke-width", 2.5)
      .attr("d", line);

    // Animate curve drawing
    const totalLength = (path.node() as SVGPathElement)?.getTotalLength() || 0;
    path
      .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(800)
      .attr("stroke-dashoffset", 0);

    // Data points
    if (activationStep.points && currentStep >= 1) {
      const { x: px, y: py } = activationStep.points;
      px.forEach((xVal, i) => {
        const yVal = py[i];
        // Input dot
        g.append("circle")
          .attr("cx", xScale(xVal))
          .attr("cy", yScale(0))
          .attr("r", 0)
          .attr("fill", "#3b82f6")
          .transition()
          .delay(900 + i * 100)
          .duration(300)
          .attr("r", 4);

        // Output dot
        g.append("circle")
          .attr("cx", xScale(xVal))
          .attr("cy", yScale(yVal))
          .attr("r", 0)
          .attr("fill", "#EE4C2C")
          .transition()
          .delay(900 + i * 100 + 200)
          .duration(300)
          .attr("r", 5);

        // Connecting line
        g.append("line")
          .attr("x1", xScale(xVal))
          .attr("x2", xScale(xVal))
          .attr("y1", yScale(0))
          .attr("y2", yScale(0))
          .attr("stroke", "#94a3b8")
          .attr("stroke-dasharray", "2")
          .transition()
          .delay(900 + i * 100 + 100)
          .duration(200)
          .attr("y2", yScale(yVal));
      });
    }
  }, [activationStep, currentStep]);

  if (steps.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-center gap-8">
        {inputStep && currentStep >= 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <TensorGrid data={inputStep.data} shape={inputStep.shape} label="Input" />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: currentStep >= 1 ? 1 : 0 }}
          className="rounded-lg border bg-white p-2"
        >
          <svg ref={svgRef} />
        </motion.div>

        {activationStep?.result && currentStep >= 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <TensorGrid
              data={activationStep.result.data}
              shape={activationStep.result.shape}
              label="Output"
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
