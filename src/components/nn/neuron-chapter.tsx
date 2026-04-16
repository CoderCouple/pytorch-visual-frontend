"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { PythonEditor } from "@/components/operations/python-editor";
import { runCode } from "@/lib/api";

/* ── Helpers ─────────────────────────────────────────────── */

function relu(x: number) {
  return Math.max(0, x);
}
function fmt(n: number, d = 2) {
  return n.toFixed(d);
}

/* ── Editable Code Block ─────────────────────────────────── */

function CodeBlock({ initialCode }: { initialCode: string }) {
  const [code, setCode] = useState(initialCode);
  const [stdout, setStdout] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRun = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await runCode(code);
      setStdout(res.stdout);
      setError(res.error ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to execute");
    } finally {
      setLoading(false);
    }
  }, [code]);

  return (
    <div className="max-w-2xl mx-auto">
      <PythonEditor
        code={code}
        onChange={setCode}
        onRun={handleRun}
        loading={loading}
        stdout={stdout}
        error={error}
      />
    </div>
  );
}

// Colors per input index (used for connection lines)
const INPUT_COLORS = ["#3b82f6", "#f59e0b", "#22c55e", "#ef4444"];

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
};

/* ── Single Neuron Visualization ─────────────────────────── */

function SingleNeuronViz() {
  const [inputs, setInputs] = useState([0.5, -0.3, 0.7]);
  const W = [0.5, -0.3, 0.8];
  const b = 0.1;

  const products = inputs.map((x, i) => x * W[i]);
  const z = products.reduce((a, v) => a + v, 0) + b;
  const y = relu(z);
  const [showActivation, setShowActivation] = useState(true);
  const output = showActivation ? y : z;

  const inputYs = [60, 150, 240];
  const nX = 300,
    nY = 150;

  return (
    <div className="rounded-xl border bg-card p-6 space-y-6">
      <div className="text-sm font-medium text-center text-muted-foreground">
        Drag the sliders to change inputs and watch the neuron respond
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => setShowActivation((s) => !s)}
          className="text-xs px-3 py-1.5 rounded-full border transition-colors hover:bg-muted font-medium"
        >
          {showActivation ? "Hide Activation" : "Show Activation"}
        </button>
      </div>

      {!showActivation && (
        <div className="text-center">
          <div className="inline-block bg-muted px-6 py-3 rounded-xl font-mono">
            <span className="text-purple-500 font-bold">Z</span>
            {" = "}
            <span className="text-green-600">W₁</span>
            {"·"}
            <span className="text-blue-500">X₁</span>
            {" + "}
            <span className="text-red-500">W₂</span>
            {"·"}
            <span className="text-blue-500">X₂</span>
            {" + "}
            <span className="text-green-600">W₃</span>
            {"·"}
            <span className="text-blue-500">X₃</span>
            {" + "}
            <span className="text-muted-foreground">b</span>
          </div>
        </div>
      )}

      {/* SVG Diagram */}
      <svg
        viewBox="0 0 620 300"
        className="w-full max-w-2xl mx-auto"
        style={{ maxHeight: 320 }}
      >
        <defs>
          <marker
            id="arr1"
            markerWidth="8"
            markerHeight="6"
            refX="8"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#888" />
          </marker>
        </defs>

        {/* Connection lines */}
        {W.map((w, i) => (
          <line
            key={`c${i}`}
            x1={102}
            y1={inputYs[i]}
            x2={nX - 36}
            y2={nY}
            stroke={INPUT_COLORS[i]}
            strokeWidth={1.5 + Math.abs(w) * 2.5}
            strokeOpacity={0.5}
          />
        ))}

        {/* Weight labels */}
        {W.map((w, i) => {
          const mx = 170;
          const my = (inputYs[i] + nY) / 2 + (i === 1 ? -12 : -6);
          return (
            <text
              key={`w${i}`}
              x={mx}
              y={my}
              textAnchor="middle"
              fill={INPUT_COLORS[i]}
              fontSize={10}
              fontFamily="monospace"
            >
              w{i + 1}={fmt(w)}
            </text>
          );
        })}

        {/* Input nodes */}
        {inputs.map((x, i) => (
          <g key={`in${i}`}>
            <circle
              cx={80}
              cy={inputYs[i]}
              r={24}
              fill={INPUT_COLORS[i]}
              fillOpacity={0.12}
              stroke={INPUT_COLORS[i]}
              strokeWidth={2}
            />
            <text
              x={80}
              y={inputYs[i] - 7}
              textAnchor="middle"
              fill={INPUT_COLORS[i]}
              fontSize={11}
              fontWeight={600}
            >
              X{i + 1}
            </text>
            <text
              x={80}
              y={inputYs[i] + 12}
              textAnchor="middle"
              fill="currentColor"
              fontSize={13}
              fontFamily="monospace"
              fontWeight={700}
            >
              {fmt(x)}
            </text>
          </g>
        ))}

        {/* Neuron body */}
        <circle
          cx={nX}
          cy={nY}
          r={36}
          fill="#8b5cf6"
          fillOpacity={0.12}
          stroke="#8b5cf6"
          strokeWidth={2}
        />
        <text
          x={nX}
          y={nY - 4}
          textAnchor="middle"
          fill="currentColor"
          fontSize={22}
          fontWeight={700}
        >
          {"Σ"}
        </text>
        <text
          x={nX}
          y={nY + 16}
          textAnchor="middle"
          fill="#888"
          fontSize={11}
        >
          + b
        </text>
        <text
          x={nX}
          y={nY + 54}
          textAnchor="middle"
          fill="#888"
          fontSize={11}
          fontFamily="monospace"
        >
          z = {fmt(z, 3)}
        </text>

        {/* Arrow → next stage */}
        <line
          x1={nX + 36}
          y1={nY}
          x2={showActivation ? 418 : 430}
          y2={nY}
          stroke="#888"
          strokeWidth={1.5}
          markerEnd="url(#arr1)"
        />

        {showActivation && (
          <>
            {/* Activation box */}
            <rect
              x={420}
              y={nY - 22}
              width={72}
              height={44}
              rx={10}
              fill="#f59e0b"
              fillOpacity={0.12}
              stroke="#f59e0b"
              strokeWidth={2}
            />
            <text
              x={456}
              y={nY + 5}
              textAnchor="middle"
              fill="currentColor"
              fontSize={13}
              fontFamily="monospace"
              fontWeight={600}
            >
              ReLU
            </text>

            {/* Arrow → output */}
            <line
              x1={492}
              y1={nY}
              x2={528}
              y2={nY}
              stroke="#888"
              strokeWidth={1.5}
              markerEnd="url(#arr1)"
            />
          </>
        )}

        {/* Output node */}
        {(() => {
          const ox = showActivation ? 556 : 458;
          const label = showActivation ? "ŷ" : "z";
          return (
            <>
              <circle
                cx={ox}
                cy={nY}
                r={26}
                fill={output > 0 ? "#22c55e" : "#6b7280"}
                fillOpacity={0.12}
                stroke={output > 0 ? "#22c55e" : "#6b7280"}
                strokeWidth={2}
              />
              <text
                x={ox}
                y={nY - 8}
                textAnchor="middle"
                fill="#888"
                fontSize={10}
                fontWeight={600}
              >
                {label}
              </text>
              <text
                x={ox}
                y={nY + 10}
                textAnchor="middle"
                fill="currentColor"
                fontSize={14}
                fontFamily="monospace"
                fontWeight={700}
              >
                {fmt(output, 3)}
              </text>
            </>
          );
        })()}
      </svg>

      {/* Sliders */}
      <div className="max-w-sm mx-auto space-y-3">
        {inputs.map((x, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-sm font-mono font-semibold w-6" style={{ color: INPUT_COLORS[i] }}>
              X{i + 1}
            </span>
            <Slider
              min={-100}
              max={100}
              step={1}
              value={[Math.round(x * 100)]}
              onValueChange={(val) => {
                const v = Array.isArray(val) ? val : [val];
                const next = [...inputs];
                next[i] = v[0] / 100;
                setInputs(next);
              }}
            />
            <span className="text-sm font-mono w-12 text-right">{fmt(x)}</span>
          </div>
        ))}
      </div>

      {/* Computation breakdown */}
      <div className="p-4 rounded-lg bg-muted/50 font-mono text-sm max-w-lg mx-auto space-y-1">
        <div className="text-muted-foreground text-xs mb-2">
          Step-by-step computation:
        </div>
        <div>
          z ={" "}
          {products.map((_, i) => (
            <span key={i}>
              {i > 0 && " + "}
              <span className="text-muted-foreground">
                ({fmt(inputs[i])} × {fmt(W[i])})
              </span>
            </span>
          ))}{" "}
          + {fmt(b)}
        </div>
        <div>
          z ={" "}
          {products.map((p, i) => (
            <span key={i}>
              {i > 0 && " + "}
              <span
                className={
                  p >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-500"
                }
              >
                {fmt(p, 3)}
              </span>
            </span>
          ))}{" "}
          + {fmt(b)} = <strong>{fmt(z, 3)}</strong>
        </div>
        {showActivation && (
          <div>
            {"ŷ"} = ReLU({fmt(z, 3)}) ={" "}
            <strong
              className={
                y > 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-muted-foreground"
              }
            >
              {fmt(y, 3)}
            </strong>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Layer of Neurons Visualization ──────────────────────── */

function NeuronLayerViz() {
  const [inputs, setInputs] = useState([1.0, 2.0, 3.0, 2.5]);

  const neurons = [
    { W: [0.2, 0.8, -0.5, 1.0], b: 2.0, label: "N₁" },
    { W: [0.5, -0.91, 0.26, -0.5], b: 3.0, label: "N₂" },
    { W: [-0.26, -0.27, 0.17, 0.87], b: 0.5, label: "N₃" },
  ];

  const [showActivation, setShowActivation] = useState(true);

  const results = neurons.map(({ W, b }) => {
    const z = inputs.reduce((sum, x, i) => sum + x * W[i], 0) + b;
    return { z, y: relu(z) };
  });

  const inputYs = [55, 145, 235, 325];
  const neuronYs = [100, 190, 280];

  return (
    <div className="rounded-xl border bg-card p-6 space-y-6">
      <div className="text-sm font-medium text-center text-muted-foreground">
        Same inputs, different weights per neuron — each neuron detects a
        different pattern
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => setShowActivation((s) => !s)}
          className="text-xs px-3 py-1.5 rounded-full border transition-colors hover:bg-muted font-medium"
        >
          {showActivation ? "Hide Activation" : "Show Activation"}
        </button>
      </div>

      {!showActivation && (
        <div className="space-y-2 max-w-2xl mx-auto">
          {neurons.map((n, ni) => (
            <div key={ni} className="bg-muted px-5 py-2.5 rounded-xl font-mono text-sm flex flex-wrap items-center gap-x-1">
              <span className="text-purple-500 font-bold">Z{ni + 1}</span>
              {" = "}
              {n.W.map((w, wi) => (
                <span key={wi}>
                  {wi > 0 && " + "}
                  <span className="text-muted-foreground">w{ni + 1}{wi + 1}</span>
                  {"·"}
                  <span style={{ color: INPUT_COLORS[wi] }}>X{wi + 1}</span>
                </span>
              ))}
              {" + "}
              <span className="text-muted-foreground">b</span>
              {" = "}
              {n.W.map((w, wi) => (
                <span key={wi}>
                  {wi > 0 && " + "}
                  <span className={w >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500"}>
                    {fmt(w)}
                  </span>
                  {"·"}
                  <span style={{ color: INPUT_COLORS[wi] }}>{fmt(inputs[wi])}</span>
                </span>
              ))}
              {" + "}
              <span className="text-muted-foreground">{fmt(n.b)}</span>
              {" = "}
              <span className="font-bold">{fmt(results[ni].z, 3)}</span>
            </div>
          ))}
        </div>
      )}

      <svg
        viewBox="0 0 640 380"
        className="w-full max-w-2xl mx-auto"
        style={{ maxHeight: 400 }}
      >
        <defs>
          <marker
            id="arr2"
            markerWidth="8"
            markerHeight="6"
            refX="8"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#888" />
          </marker>
        </defs>

        {/* Connections: each input → each neuron with wᵢⱼ labels */}
        {neurons.map((n, ni) =>
          n.W.map((w, wi) => {
            const x1 = 102, y1 = inputYs[wi], x2 = 288, y2 = neuronYs[ni];
            const mx = x1 + (x2 - x1) * 0.45;
            const my = y1 + (y2 - y1) * 0.45;
            return (
              <g key={`c${ni}-${wi}`}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={INPUT_COLORS[wi]}
                  strokeWidth={1 + Math.abs(w) * 2}
                  strokeOpacity={0.35}
                />
                <text
                  x={mx}
                  y={my - 4}
                  textAnchor="middle"
                  fill={INPUT_COLORS[wi]}
                  fontSize={8}
                  fontFamily="monospace"
                  opacity={0.9}
                >
                  w{ni + 1}{wi + 1}
                </text>
              </g>
            );
          })
        )}

        {/* Input nodes */}
        {inputs.map((x, i) => (
          <g key={`in${i}`}>
            <circle
              cx={80}
              cy={inputYs[i]}
              r={22}
              fill={INPUT_COLORS[i]}
              fillOpacity={0.12}
              stroke={INPUT_COLORS[i]}
              strokeWidth={2}
            />
            <text
              x={80}
              y={inputYs[i] - 6}
              textAnchor="middle"
              fill={INPUT_COLORS[i]}
              fontSize={10}
              fontWeight={600}
            >
              X{i + 1}
            </text>
            <text
              x={80}
              y={inputYs[i] + 12}
              textAnchor="middle"
              fill="currentColor"
              fontSize={12}
              fontFamily="monospace"
              fontWeight={700}
            >
              {fmt(x)}
            </text>
          </g>
        ))}

        {/* Neurons + activation + output */}
        {neurons.map((n, ni) => {
          const ny = neuronYs[ni];
          const r = results[ni];
          return (
            <g key={`n${ni}`}>
              {/* Neuron body */}
              <circle
                cx={320}
                cy={ny}
                r={32}
                fill="#8b5cf6"
                fillOpacity={0.12}
                stroke="#8b5cf6"
                strokeWidth={2}
              />
              <text
                x={320}
                y={ny - 4}
                textAnchor="middle"
                fill="currentColor"
                fontSize={13}
                fontWeight={700}
              >
                {n.label}
              </text>
              <text
                x={320}
                y={ny + 14}
                textAnchor="middle"
                fill="#888"
                fontSize={10}
                fontFamily="monospace"
              >
                {"Σ + b"}
              </text>

              {/* Arrow → next stage */}
              <line
                x1={352}
                y1={ny}
                x2={showActivation ? 398 : 410}
                y2={ny}
                stroke="#888"
                strokeWidth={1.5}
                markerEnd="url(#arr2)"
              />

              {showActivation && (
                <>
                  {/* Activation */}
                  <rect
                    x={400}
                    y={ny - 16}
                    width={56}
                    height={32}
                    rx={8}
                    fill="#f59e0b"
                    fillOpacity={0.12}
                    stroke="#f59e0b"
                    strokeWidth={1.5}
                  />
                  <text
                    x={428}
                    y={ny + 5}
                    textAnchor="middle"
                    fill="currentColor"
                    fontSize={10}
                    fontFamily="monospace"
                    fontWeight={600}
                  >
                    ReLU
                  </text>

                  {/* Arrow → output */}
                  <line
                    x1={456}
                    y1={ny}
                    x2={498}
                    y2={ny}
                    stroke="#888"
                    strokeWidth={1.5}
                    markerEnd="url(#arr2)"
                  />
                </>
              )}

              {/* Output */}
              {(() => {
                const ox = showActivation ? 522 : 438;
                const val = showActivation ? r.y : r.z;
                const label = showActivation ? `y${ni + 1}` : `z${ni + 1}`;
                return (
                  <>
                    <circle
                      cx={ox}
                      cy={ny}
                      r={22}
                      fill={val > 0 ? "#22c55e" : "#6b7280"}
                      fillOpacity={0.12}
                      stroke={val > 0 ? "#22c55e" : "#6b7280"}
                      strokeWidth={2}
                    />
                    <text
                      x={ox}
                      y={ny - 5}
                      textAnchor="middle"
                      fill="#888"
                      fontSize={9}
                      fontWeight={600}
                    >
                      {label}
                    </text>
                    <text
                      x={ox}
                      y={ny + 11}
                      textAnchor="middle"
                      fill="currentColor"
                      fontSize={12}
                      fontFamily="monospace"
                      fontWeight={700}
                    >
                      {fmt(val, 3)}
                    </text>
                  </>
                );
              })()}
            </g>
          );
        })}
      </svg>

      {/* Sliders */}
      <div className="max-w-sm mx-auto space-y-3">
        {inputs.map((x, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-sm font-mono font-semibold w-6" style={{ color: INPUT_COLORS[i] }}>
              X{i + 1}
            </span>
            <Slider
              min={-500}
              max={500}
              step={1}
              value={[Math.round(x * 100)]}
              onValueChange={(val) => {
                const v = Array.isArray(val) ? val : [val];
                const next = [...inputs];
                next[i] = v[0] / 100;
                setInputs(next);
              }}
            />
            <span className="text-sm font-mono w-12 text-right">{fmt(x)}</span>
          </div>
        ))}
      </div>

      {/* Weight matrix table */}
      <div className="max-w-lg mx-auto">
        <div className="text-sm font-semibold text-center mb-2">
          Weight Matrix — each row is one neuron&apos;s weights
        </div>
        <div className="overflow-x-auto">
          <table className="mx-auto border-collapse font-mono text-sm">
            <thead>
              <tr>
                <td className="px-2 py-1"></td>
                {inputs.map((_, wi) => (
                  <td key={wi} className="px-2 py-1 text-center text-blue-500 font-semibold text-xs">
                    w·{wi + 1}
                  </td>
                ))}
                <td className="px-2 py-1 text-center text-muted-foreground text-xs">
                  bias
                </td>
                <td className="px-2 py-1 text-center font-semibold text-xs">
                  output
                </td>
              </tr>
            </thead>
            <tbody>
              {neurons.map((n, ni) => (
                <tr key={ni} className="border-t border-border">
                  <td className="px-2 py-1.5 text-purple-500 font-semibold">
                    {n.label}
                  </td>
                  {n.W.map((w, wi) => (
                    <td
                      key={wi}
                      className={`px-2 py-1.5 text-center text-xs ${w >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500"}`}
                      title={`w${ni + 1}${wi + 1}`}
                    >
                      <div className="text-[9px] text-muted-foreground">w{ni + 1}{wi + 1}</div>
                      {fmt(w)}
                    </td>
                  ))}
                  <td className="px-3 py-1.5 text-center text-muted-foreground">
                    {fmt(n.b)}
                  </td>
                  <td
                    className={`px-3 py-1.5 text-center font-bold ${(showActivation ? results[ni].y : results[ni].z) > 0 ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}
                  >
                    {fmt(showActivation ? results[ni].y : results[ni].z, 3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Batch Input Visualization ───────────────────────────── */

function BatchInputViz() {
  const [batch, setBatch] = useState([
    [1.0, 2.0, 3.0, 2.5],
    [-0.8, 0.4, 0.1, 1.2],
    [0.2, 0.9, -0.5, 0.3],
  ]);
  const [selectedRow, setSelectedRow] = useState(0);
  const [showActivation, setShowActivation] = useState(true);

  const neuronsData = [
    { W: [0.2, 0.8, -0.5, 1.0], b: 2.0, label: "N₁" },
    { W: [0.5, -0.91, 0.26, -0.5], b: 3.0, label: "N₂" },
    { W: [-0.26, -0.27, 0.17, 0.87], b: 0.5, label: "N₃" },
  ];

  const allResults = batch.map((row) =>
    neuronsData.map(({ W, b }) => {
      const z = row.reduce((sum, x, i) => sum + x * W[i], 0) + b;
      return { z, y: relu(z) };
    })
  );

  const outputs = allResults.map((row) =>
    row.map((r) => (showActivation ? r.y : r.z))
  );

  // Selected sample for the neuron diagram
  const selInputs = batch[selectedRow];
  const selResults = allResults[selectedRow];

  const inputYs = [55, 145, 235, 325];
  const neuronYs = [100, 190, 280];

  return (
    <div className="rounded-xl border bg-card p-6 space-y-6">
      <div className="text-sm font-medium text-center text-muted-foreground">
        Click a sample row to select it — the neuron diagram shows that
        sample flowing through the layer
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => setShowActivation((s) => !s)}
          className="text-xs px-3 py-1.5 rounded-full border transition-colors hover:bg-muted font-medium"
        >
          {showActivation ? "Hide Activation" : "Show Activation"}
        </button>
      </div>

      {/* Neuron diagram for selected sample */}
      <div>
        <div className="text-xs text-center text-muted-foreground mb-1">
          Sample s{selectedRow + 1} through the layer
        </div>
        <svg
          viewBox="0 0 640 380"
          className="w-full max-w-2xl mx-auto"
          style={{ maxHeight: 400 }}
        >
          <defs>
            <marker
              id="arr3"
              markerWidth="8"
              markerHeight="6"
              refX="8"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#888" />
            </marker>
          </defs>

          {/* Connections */}
          {neuronsData.map((n, ni) =>
            n.W.map((w, wi) => (
              <line
                key={`bc${ni}-${wi}`}
                x1={102}
                y1={inputYs[wi]}
                x2={288}
                y2={neuronYs[ni]}
                stroke={INPUT_COLORS[wi]}
                strokeWidth={1 + Math.abs(w) * 2}
                strokeOpacity={0.35}
              />
            ))
          )}

          {/* Input nodes */}
          {selInputs.map((x, i) => (
            <g key={`bin${i}`}>
              <circle
                cx={80}
                cy={inputYs[i]}
                r={22}
                fill={INPUT_COLORS[i]}
                fillOpacity={0.12}
                stroke={INPUT_COLORS[i]}
                strokeWidth={2}
              />
              <text
                x={80}
                y={inputYs[i] - 6}
                textAnchor="middle"
                fill={INPUT_COLORS[i]}
                fontSize={10}
                fontWeight={600}
              >
                X{i + 1}
              </text>
              <text
                x={80}
                y={inputYs[i] + 12}
                textAnchor="middle"
                fill="currentColor"
                fontSize={12}
                fontFamily="monospace"
                fontWeight={700}
              >
                {fmt(x)}
              </text>
            </g>
          ))}

          {/* Neurons + output */}
          {neuronsData.map((n, ni) => {
            const ny = neuronYs[ni];
            const r = selResults[ni];
            const val = showActivation ? r.y : r.z;
            return (
              <g key={`bn${ni}`}>
                {/* Neuron body */}
                <circle
                  cx={320}
                  cy={ny}
                  r={32}
                  fill="#8b5cf6"
                  fillOpacity={0.12}
                  stroke="#8b5cf6"
                  strokeWidth={2}
                />
                <text
                  x={320}
                  y={ny - 4}
                  textAnchor="middle"
                  fill="currentColor"
                  fontSize={13}
                  fontWeight={700}
                >
                  {n.label}
                </text>
                <text
                  x={320}
                  y={ny + 14}
                  textAnchor="middle"
                  fill="#888"
                  fontSize={10}
                  fontFamily="monospace"
                >
                  {"Σ + b"}
                </text>

                {/* Arrow → next stage */}
                <line
                  x1={352}
                  y1={ny}
                  x2={showActivation ? 398 : 410}
                  y2={ny}
                  stroke="#888"
                  strokeWidth={1.5}
                  markerEnd="url(#arr3)"
                />

                {showActivation && (
                  <>
                    <rect
                      x={400}
                      y={ny - 16}
                      width={56}
                      height={32}
                      rx={8}
                      fill="#f59e0b"
                      fillOpacity={0.12}
                      stroke="#f59e0b"
                      strokeWidth={1.5}
                    />
                    <text
                      x={428}
                      y={ny + 5}
                      textAnchor="middle"
                      fill="currentColor"
                      fontSize={10}
                      fontFamily="monospace"
                      fontWeight={600}
                    >
                      ReLU
                    </text>
                    <line
                      x1={456}
                      y1={ny}
                      x2={498}
                      y2={ny}
                      stroke="#888"
                      strokeWidth={1.5}
                      markerEnd="url(#arr3)"
                    />
                  </>
                )}

                {/* Output node */}
                {(() => {
                  const ox = showActivation ? 522 : 438;
                  const lbl = showActivation ? `y${ni + 1}` : `z${ni + 1}`;
                  return (
                    <>
                      <circle
                        cx={ox}
                        cy={ny}
                        r={22}
                        fill={val > 0 ? "#22c55e" : "#6b7280"}
                        fillOpacity={0.12}
                        stroke={val > 0 ? "#22c55e" : "#6b7280"}
                        strokeWidth={2}
                      />
                      <text
                        x={ox}
                        y={ny - 5}
                        textAnchor="middle"
                        fill="#888"
                        fontSize={9}
                        fontWeight={600}
                      >
                        {lbl}
                      </text>
                      <text
                        x={ox}
                        y={ny + 11}
                        textAnchor="middle"
                        fill="currentColor"
                        fontSize={12}
                        fontFamily="monospace"
                        fontWeight={700}
                      >
                        {fmt(val, 3)}
                      </text>
                    </>
                  );
                })()}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Input & Output matrices side by side */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
        {/* Input matrix */}
        <div>
          <div className="text-sm font-semibold text-center mb-2">
            Input Batch (3 samples)
          </div>
          <div className="overflow-x-auto">
            <table className="border-collapse font-mono text-sm">
              <thead>
                <tr>
                  <td className="px-2 py-1"></td>
                  {batch[0].map((_, ci) => (
                    <td key={ci} className="px-3 py-1 text-center text-xs font-semibold" style={{ color: INPUT_COLORS[ci] }}>
                      X{ci + 1}
                    </td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {batch.map((row, ri) => (
                  <tr
                    key={ri}
                    onClick={() => setSelectedRow(ri)}
                    className={`border-t border-border cursor-pointer transition-colors ${ri === selectedRow ? "bg-blue-500/10" : "hover:bg-muted/50"}`}
                  >
                    <td className="px-2 py-1.5 text-muted-foreground text-xs">
                      s{ri + 1}
                    </td>
                    {row.map((v, ci) => (
                      <td
                        key={ci}
                        className="px-3 py-1.5 text-center font-semibold"
                      >
                        {fmt(v)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Arrow */}
        <div className="text-center space-y-1 shrink-0">
          <div className="text-3xl text-muted-foreground lg:rotate-0 rotate-90">
            →
          </div>
          <div className="text-xs text-muted-foreground font-medium">
            Layer
            <br />
            (2 neurons)
          </div>
        </div>

        {/* Output matrix */}
        <div>
          <div className="text-sm font-semibold text-center mb-2">
            Output (3 × {neuronsData.length})
          </div>
          <div className="overflow-x-auto">
            <table className="border-collapse font-mono text-sm">
              <thead>
                <tr>
                  <td className="px-2 py-1"></td>
                  {neuronsData.map((_, ni) => (
                    <td key={ni} className="px-3 py-1 text-center text-purple-500 text-xs font-semibold">
                      {showActivation ? `y${ni + 1}` : `z${ni + 1}`}
                    </td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {outputs.map((row, ri) => (
                  <tr
                    key={ri}
                    onClick={() => setSelectedRow(ri)}
                    className={`border-t border-border cursor-pointer transition-colors ${ri === selectedRow ? "bg-purple-500/10" : "hover:bg-muted/50"}`}
                  >
                    <td className="px-2 py-1.5 text-muted-foreground text-xs">
                      s{ri + 1}
                    </td>
                    {row.map((v, ci) => (
                      <td
                        key={ci}
                        className={`px-3 py-1.5 text-center font-bold ${v > 0 ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}
                      >
                        {fmt(v, 3)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sliders for selected row */}
      <div className="max-w-sm mx-auto space-y-3">
        <div className="text-xs text-center text-muted-foreground mb-1">
          Editing sample s{selectedRow + 1}
        </div>
        {batch[selectedRow].map((x, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-sm font-mono font-semibold w-6" style={{ color: INPUT_COLORS[i] }}>
              X{i + 1}
            </span>
            <Slider
              min={-500}
              max={500}
              step={1}
              value={[Math.round(x * 100)]}
              onValueChange={(val) => {
                const v = Array.isArray(val) ? val : [val];
                const next = batch.map((r) => [...r]);
                next[selectedRow][i] = v[0] / 100;
                setBatch(next);
              }}
            />
            <span className="text-sm font-mono w-12 text-right">{fmt(x)}</span>
          </div>
        ))}
      </div>

      <CodeBlock initialCode={`import numpy as np

# Batch of 3 samples, each with 4 features
X = np.array([[ 1.0,  2.0,  3.0, 2.5],
              [-0.8,  0.4,  0.1, 1.2],
              [ 0.2,  0.9, -0.5, 0.3]])

# 3 neurons, each with 4 weights
W = np.array([[ 0.2,   0.8,  -0.5,  1.0],
              [ 0.5,  -0.91,  0.26, -0.5],
              [-0.26, -0.27,  0.17,  0.87]])

b = np.array([2.0, 3.0, 0.5])

# All samples through the layer at once
z = X @ W.T + b           # shape (3, 3)
output = np.maximum(0, z)  # ReLU

print("z (before activation):")
print(z)
print("\\noutput (after ReLU):")
print(output)`} />
    </div>
  );
}

/* ── Main Chapter Component ──────────────────────────────── */

export function NeuronChapter() {
  return (
    <div className="max-w-4xl mx-auto space-y-16 pb-16">
      {/* Header */}
      <motion.div {...fadeUp}>
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">The Neuron</h1>
          <Badge variant="secondary">NN from Scratch</Badge>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl">
          A neural network is{" "}
          <strong className="text-foreground">just a function</strong> composed
          of many simple functions stacked together. Strip away the buzzwords:{" "}
          <strong className="text-foreground">
            inputs → weighted sums → activation → repeat → output.
          </strong>
        </p>
      </motion.div>

      {/* ── Section 1: Single Neuron ── */}
      <motion.section className="space-y-6" {...fadeUp}>
        <h2 className="text-2xl font-bold border-b pb-2">
          1. A Single Neuron
        </h2>

        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            Each neuron computes one tiny formula:
          </p>
          <div className="text-center py-2">
            <code className="text-lg font-semibold text-foreground bg-muted px-4 py-2 rounded-lg">
              output = activation( w₁x₁ + w₂x₂ + … + wₙxₙ + b )
            </code>
          </div>
          <p>
            Think of it as a{" "}
            <strong className="text-foreground">yes/no/maybe detector</strong>.
            It takes inputs, weighs each one by importance (
            <strong className="text-foreground">weights</strong>), adds a nudge (
            <strong className="text-foreground">bias</strong>), then decides
            whether to fire through an{" "}
            <strong className="text-foreground">activation function</strong>.
          </p>
          <p>
            Each connection has a number:{" "}
            <span className="text-green-600 dark:text-green-400 font-semibold">
              big weight → important input
            </span>
            .{" "}
            <span className="text-muted-foreground">
              Near-zero weight → ignored
            </span>
            .{" "}
            <span className="text-red-500 font-semibold">
              Negative weight → suppresses the input
            </span>
            .
          </p>
        </div>

        <SingleNeuronViz />

        <CodeBlock initialCode={`inputs = [1, 2, 3]
weights = [0.2, 0.8, -0.5]
bias = 2

# Step by step: each input * its weight + bias
z = (inputs[0]*weights[0] +
     inputs[1]*weights[1] +
     inputs[2]*weights[2] + bias)

print(f"z = {z}")
print(f"output (ReLU) = {max(0, z)}")

# Same thing with numpy
import numpy as np
x = np.array(inputs)
w = np.array(weights)
z2 = np.dot(x, w) + bias
print(f"numpy dot: {z2}")`} />
      </motion.section>

      {/* ── Section 2: Layer of Neurons ── */}
      <motion.section className="space-y-6" {...fadeUp}>
        <h2 className="text-2xl font-bold border-b pb-2">
          2. A Layer of Neurons
        </h2>

        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            A layer is just{" "}
            <strong className="text-foreground">
              many neurons running in parallel
            </strong>
            . Every neuron looks at the{" "}
            <strong className="text-foreground">same inputs</strong> but with{" "}
            <strong className="text-foreground">different weights</strong> — so
            each learns to detect a different pattern.
          </p>
          <p>
            In a weight matrix, each{" "}
            <strong className="text-foreground">
              row = one neuron&apos;s weights
            </strong>
            . Computing a layer&apos;s output is just doing the dot product for
            every neuron at once.
          </p>
        </div>

        <NeuronLayerViz />

        <CodeBlock initialCode={`inputs = [1, 2, 3, 2.5]

weights = [[0.2, 0.8, -0.5, 1],
           [0.5, -0.91, 0.26, -0.5],
           [-0.26, -0.27, 0.17, 0.87]]

biases = [2, 3, 0.5]

outputs = [
    # Neuron 1:
    inputs[0]*weights[0][0] +
    inputs[1]*weights[0][1] +
    inputs[2]*weights[0][2] +
    inputs[3]*weights[0][3] + biases[0],
    # Neuron 2:
    inputs[0]*weights[1][0] +
    inputs[1]*weights[1][1] +
    inputs[2]*weights[1][2] +
    inputs[3]*weights[1][3] + biases[1],
    # Neuron 3:
    inputs[0]*weights[2][0] +
    inputs[1]*weights[2][1] +
    inputs[2]*weights[2][2] +
    inputs[3]*weights[2][3] + biases[2]
]

print(outputs)

# Same with numpy (much cleaner)
import numpy as np
X = np.array(inputs)
W = np.array(weights)
b = np.array(biases)
print("numpy:", W @ X + b)`} />
      </motion.section>

      {/* ── Section 3: Batch Input ── */}
      <motion.section className="space-y-6" {...fadeUp}>
        <h2 className="text-2xl font-bold border-b pb-2">
          3. Batch Input
        </h2>

        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            In practice, we don&apos;t feed one sample at a time — we process a{" "}
            <strong className="text-foreground">batch</strong> of samples at
            once. Each row in the input matrix is one sample, and the layer
            processes all of them simultaneously.
          </p>
          <p>
            This is just{" "}
            <strong className="text-foreground">matrix multiplication</strong>:{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
              Output = ReLU(X @ W.T + b)
            </code>
            . The GPU does all rows in parallel — that&apos;s why neural
            networks are fast.
          </p>
        </div>

        <BatchInputViz />
      </motion.section>

      {/* ── Summary ── */}
      <motion.section
        className="rounded-xl border-2 border-purple-500/20 bg-purple-500/5 p-6 space-y-3"
        {...fadeUp}
      >
        <h3 className="text-lg font-bold">One-line summary</h3>
        <p className="text-muted-foreground">
          A neural network is{" "}
          <strong className="text-foreground">
            a giant stack of weighted sums + nonlinear activations that learns
            patterns from data.
          </strong>
        </p>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>
            <strong className="text-foreground">Single neuron</strong> →
            weighted sum + bias + activation = one tiny detector
          </p>
          <p>
            <strong className="text-foreground">Layer</strong> → many neurons in
            parallel = many detectors running together
          </p>
          <p>
            <strong className="text-foreground">Batch</strong> → many samples at
            once = matrix multiplication = GPU go brrrr
          </p>
        </div>
      </motion.section>
    </div>
  );
}
