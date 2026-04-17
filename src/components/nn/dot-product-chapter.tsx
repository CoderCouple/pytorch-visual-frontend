"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { PythonEditor } from "@/components/operations/python-editor";
import { runCode } from "@/lib/api";

/* ── Helpers ─────────────────────────────────────────────── */

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

const INPUT_COLORS = ["#3b82f6", "#f59e0b", "#22c55e", "#ef4444"];

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
};

/* ── Data (from lecture) ─────────────────────────────────── */

const W_MATRIX = [
  [0.2, 0.8, -0.5],
  [0.5, -0.91, 0.26],
  [-0.26, -0.27, 0.17],
];
const BIASES = [0.1, -0.2, 0.05];
const BATCH_X_DEFAULT = [
  [1.0, 2.0, 3.0],
  [2.0, 5.0, -1.0],
  [-1.5, 2.7, 3.3],
];

/* ── Shared cell styles ──────────────────────────────────── */

const CELL =
  "flex items-center justify-center font-mono text-sm font-bold transition-colors";
const CELL_MD = "w-[4.5rem] h-11";
const CELL_SM = "w-14 h-9";

/* ── Detail panel: shows element-wise products + sum ─────── */

function DetailPanel({
  title,
  labelA,
  labelB,
  vecA,
  vecB,
  bias,
  resultLabel,
}: {
  title: string;
  labelA: string;
  labelB: string;
  vecA: number[];
  vecB: number[];
  bias?: number;
  resultLabel: string;
}) {
  const prods = vecA.map((a, i) => a * vecB[i]);
  const dot = prods.reduce((a, v) => a + v, 0);
  const final = bias !== undefined ? dot + bias : dot;

  return (
    <div className="max-w-xl mx-auto rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/20 p-5 space-y-4">
      <div className="text-center font-semibold">
        Computing{" "}
        <strong dangerouslySetInnerHTML={{ __html: title }} />
      </div>

      {/* Extracted vectors */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <div>
          <div className="text-xs text-muted-foreground text-center mb-1">
            {labelA}
          </div>
          <div className="flex rounded-lg overflow-hidden border-2 border-blue-400">
            {vecA.map((v, i) => (
              <div
                key={i}
                className={`${CELL} ${CELL_SM} bg-blue-50 dark:bg-blue-500/15 border-r last:border-r-0 border-blue-200 dark:border-blue-400/30 text-blue-700 dark:text-blue-300 text-xs`}
              >
                {fmt(v)}
              </div>
            ))}
          </div>
        </div>
        <div className="text-lg text-muted-foreground font-bold">·</div>
        <div>
          <div className="text-xs text-muted-foreground text-center mb-1">
            {labelB}
          </div>
          <div className="flex rounded-lg overflow-hidden border-2 border-green-400">
            {vecB.map((v, i) => (
              <div
                key={i}
                className={`${CELL} ${CELL_SM} bg-green-50 dark:bg-green-500/15 border-r last:border-r-0 border-green-200 dark:border-green-400/30 text-green-700 dark:text-green-300 text-xs`}
              >
                {fmt(v)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Element-wise products */}
      <div className="text-center font-mono text-sm">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          {prods.map((p, i) => (
            <span key={i} className="whitespace-nowrap">
              {i > 0 && (
                <span className="text-muted-foreground mr-4">+</span>
              )}
              <span className="text-blue-600 dark:text-blue-400">
                {fmt(vecA[i])}
              </span>
              <span className="text-muted-foreground"> × </span>
              <span className="text-green-600 dark:text-green-400">
                {fmt(vecB[i])}
              </span>
              <span className="text-muted-foreground"> = </span>
              <strong>{fmt(p, 3)}</strong>
            </span>
          ))}
        </div>

        {/* Sum row */}
        <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
          <span>
            {prods.map((p, i) => (
              <span key={i}>
                {i > 0 && (
                  <span className="text-muted-foreground"> + </span>
                )}
                {fmt(p, 3)}
              </span>
            ))}
            {bias !== undefined && (
              <span className="text-muted-foreground">
                {" "}
                + {fmt(bias)}
              </span>
            )}
          </span>
          <span className="text-muted-foreground">=</span>
          <span className="inline-flex items-center gap-2">
            <span className="bg-red-500 text-white px-3 py-1 rounded-lg font-bold text-base">
              {fmt(final, 3)}
            </span>
            <span className="text-muted-foreground text-xs">
              → {resultLabel}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Section 1: Vector × Vector ──────────────────────────── */

function VectorDotViz() {
  const [inputs, setInputs] = useState([1.0, 2.0, 3.0]);
  const w = W_MATRIX[0]; // [0.2, 0.8, -0.5]
  const b = BIASES[0]; // 0.1

  const products = inputs.map((x, i) => x * w[i]);
  const dotVal = products.reduce((a, v) => a + v, 0);
  const result = dotVal + b;

  return (
    <div className="rounded-xl border bg-card p-6 space-y-6">
      <div className="text-sm font-medium text-center text-muted-foreground">
        Drag the sliders to change x — watch the dot product update
      </div>

      {/* Grid: w · x = scalar */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        {/* w vector */}
        <div className="text-center">
          <div className="text-xs font-semibold mb-1.5 text-muted-foreground">
            <span className="font-bold text-foreground">w</span>{" "}
            <span className="opacity-60">[3]</span>
          </div>
          <div className="flex rounded-lg overflow-hidden border-2 border-blue-400">
            {w.map((wv, i) => (
              <div
                key={i}
                className={`${CELL} ${CELL_MD} bg-blue-50 dark:bg-blue-500/15 border-r last:border-r-0 border-blue-200 dark:border-blue-400/30`}
              >
                {fmt(wv)}
              </div>
            ))}
          </div>
        </div>

        <div className="text-2xl text-muted-foreground font-bold">·</div>

        {/* x vector */}
        <div className="text-center">
          <div className="text-xs font-semibold mb-1.5 text-muted-foreground">
            <span className="font-bold text-foreground">x</span>{" "}
            <span className="opacity-60">[3]</span>
          </div>
          <div className="flex rounded-lg overflow-hidden border-2 border-green-400">
            {inputs.map((x, i) => (
              <div
                key={i}
                className={`${CELL} ${CELL_MD} bg-green-50 dark:bg-green-500/15 border-r last:border-r-0 border-green-200 dark:border-green-400/30`}
              >
                {fmt(x)}
              </div>
            ))}
          </div>
        </div>

        <div className="text-2xl text-muted-foreground font-bold">=</div>

        {/* Result scalar */}
        <div className="text-center">
          <div className="text-xs font-semibold mb-1.5 text-muted-foreground">
            scalar
          </div>
          <div
            className={`${CELL} w-20 h-11 bg-red-500 text-white rounded-lg text-base`}
          >
            {fmt(dotVal, 3)}
          </div>
        </div>
      </div>

      {/* Detail panel */}
      <DetailPanel
        title="w·x"
        labelA="w"
        labelB="x"
        vecA={w}
        vecB={inputs}
        resultLabel="w·x"
      />

      {/* +b result */}
      <div className="text-center font-mono text-sm">
        w·x + b = {fmt(dotVal, 3)} + {fmt(b)} ={" "}
        <strong className="text-base">{fmt(result, 3)}</strong>
      </div>

      {/* Sliders */}
      <div className="max-w-sm mx-auto space-y-3">
        {inputs.map((x, i) => (
          <div key={i} className="flex items-center gap-3">
            <span
              className="text-sm font-mono font-semibold w-6"
              style={{ color: INPUT_COLORS[i] }}
            >
              x{i + 1}
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
    </div>
  );
}

/* ── Section 2: Matrix × Vector ──────────────────────────── */

function MatrixVectorViz() {
  const [inputs, setInputs] = useState([1.0, 2.0, 3.0]);
  const [activeRow, setActiveRow] = useState(0);

  const outputs = W_MATRIX.map(
    (row, j) =>
      row.reduce((sum, w, i) => sum + w * inputs[i], 0) + BIASES[j]
  );

  return (
    <div className="rounded-xl border bg-card p-6 space-y-6">
      <div className="text-sm font-medium text-center text-muted-foreground">
        Click an output cell to see that row&apos;s computation
      </div>

      {/* Grid: W × x + b = z */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        {/* W matrix */}
        <div className="text-center">
          <div className="text-xs font-semibold mb-1.5 text-muted-foreground">
            <span className="font-bold text-foreground">W</span>{" "}
            <span className="opacity-60">[3×3]</span>
          </div>
          <div className="space-y-0.5">
            {W_MATRIX.map((row, ri) => {
              const isActive = ri === activeRow;
              return (
                <div
                  key={ri}
                  onClick={() => setActiveRow(ri)}
                  className={`flex rounded-lg overflow-hidden border-2 cursor-pointer transition-colors ${
                    isActive
                      ? "border-blue-400"
                      : "border-transparent hover:border-blue-200 dark:hover:border-blue-400/30"
                  }`}
                >
                  {row.map((w, ci) => (
                    <div
                      key={ci}
                      className={`${CELL} ${CELL_MD} border-r last:border-r-0 ${
                        isActive
                          ? "bg-blue-100 dark:bg-blue-500/20 border-blue-200 dark:border-blue-400/30"
                          : "bg-card border-border"
                      }`}
                    >
                      {fmt(w)}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-2xl text-muted-foreground font-bold">×</div>

        {/* x column vector */}
        <div className="text-center">
          <div className="text-xs font-semibold mb-1.5 text-muted-foreground">
            <span className="font-bold text-foreground">x</span>{" "}
            <span className="opacity-60">[3]</span>
          </div>
          <div className="flex flex-col rounded-lg overflow-hidden border-2 border-green-400">
            {inputs.map((x, i) => (
              <div
                key={i}
                className={`${CELL} ${CELL_MD} bg-green-50 dark:bg-green-500/15 border-b last:border-b-0 border-green-200 dark:border-green-400/30`}
              >
                {fmt(x)}
              </div>
            ))}
          </div>
        </div>

        <div className="text-xl text-muted-foreground font-bold">+</div>

        {/* b column vector */}
        <div className="text-center">
          <div className="text-xs font-semibold mb-1.5 text-muted-foreground">
            <span className="font-bold text-foreground">b</span>{" "}
            <span className="opacity-60">[3]</span>
          </div>
          <div className="flex flex-col rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600">
            {BIASES.map((bv, i) => (
              <div
                key={i}
                className={`${CELL} ${CELL_MD} bg-card border-b last:border-b-0 border-border text-muted-foreground`}
              >
                {fmt(bv)}
              </div>
            ))}
          </div>
        </div>

        <div className="text-2xl text-muted-foreground font-bold">=</div>

        {/* z output column */}
        <div className="text-center">
          <div className="text-xs font-semibold mb-1.5 text-muted-foreground">
            <span className="font-bold text-foreground">z</span>{" "}
            <span className="opacity-60">[3]</span>
          </div>
          <div className="space-y-0.5">
            {outputs.map((z, j) => (
              <div
                key={j}
                onClick={() => setActiveRow(j)}
                className={`rounded-lg overflow-hidden border-2 cursor-pointer transition-colors ${
                  j === activeRow
                    ? "border-red-500"
                    : "border-transparent hover:border-red-200 dark:hover:border-red-400/30"
                }`}
              >
                <div
                  className={`${CELL} w-20 h-11 ${
                    j === activeRow
                      ? "bg-red-500 text-white"
                      : "bg-green-50 dark:bg-green-500/10"
                  }`}
                >
                  {fmt(z, 3)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail panel */}
      <DetailPanel
        title={`z[${activeRow}]`}
        labelA={`row ${activeRow} of W`}
        labelB="x"
        vecA={W_MATRIX[activeRow]}
        vecB={inputs}
        bias={BIASES[activeRow]}
        resultLabel={`z[${activeRow}]`}
      />

      {/* Sliders */}
      <div className="max-w-sm mx-auto space-y-3">
        {inputs.map((x, i) => (
          <div key={i} className="flex items-center gap-3">
            <span
              className="text-sm font-mono font-semibold w-6"
              style={{ color: INPUT_COLORS[i] }}
            >
              x{i + 1}
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
    </div>
  );
}

/* ── Section 3: Matrix × Matrix (Batch) ──────────────────── */

function MatrixMatrixViz() {
  const [activeCell, setActiveCell] = useState<[number, number]>([0, 0]);
  const [activeR, activeC] = activeCell;
  const X = BATCH_X_DEFAULT;

  // W^T for display
  const WT = W_MATRIX[0].map((_, i) => W_MATRIX.map((row) => row[i]));

  // Output = X @ W.T + b → (3, 3)
  const output = X.map((xRow) =>
    W_MATRIX.map(
      (wRow, j) =>
        xRow.reduce((sum, x, i) => sum + x * wRow[i], 0) + BIASES[j]
    )
  );

  // Column j of W^T = row j of W
  const activeColVec = WT.map((row) => row[activeC]);

  return (
    <div className="rounded-xl border bg-card p-6 space-y-6">
      <div className="text-sm font-medium text-center text-muted-foreground">
        Click any output cell to see its computation
      </div>

      {/* Shape annotation */}
      <div className="text-center">
        <code className="text-sm font-semibold text-foreground bg-muted px-4 py-2 rounded-lg">
          <span className="text-blue-500">(3,3)</span>
          {" · "}
          <span className="text-green-600 dark:text-green-400">(3,3)</span>
          <sup>T</sup>
          {" + b → "}
          <span className="text-red-500">(3,3)</span>
        </code>
      </div>

      {/* Grid: X · W^T + b = C */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        {/* X matrix */}
        <div className="text-center">
          <div className="text-xs font-semibold mb-1.5 text-muted-foreground">
            <span className="font-bold text-foreground">X</span>{" "}
            <span className="opacity-60">[3×3]</span>
          </div>
          <div className="space-y-0.5">
            {X.map((row, ri) => {
              const isActive = ri === activeR;
              return (
                <div
                  key={ri}
                  className={`flex rounded-lg overflow-hidden border-2 transition-colors ${
                    isActive ? "border-blue-400" : "border-transparent"
                  }`}
                >
                  {row.map((v, ci) => (
                    <div
                      key={ci}
                      className={`${CELL} ${CELL_MD} border-r last:border-r-0 ${
                        isActive
                          ? "bg-blue-100 dark:bg-blue-500/20 border-blue-200 dark:border-blue-400/30"
                          : "bg-card border-border"
                      }`}
                    >
                      {fmt(v)}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-2xl text-muted-foreground font-bold">×</div>

        {/* W^T matrix — column highlight */}
        <div className="text-center">
          <div className="text-xs font-semibold mb-1.5 text-muted-foreground">
            <span className="font-bold text-foreground">
              W<sup>T</sup>
            </span>{" "}
            <span className="opacity-60">[3×3]</span>
          </div>
          <div className="space-y-0.5">
            {WT.map((row, ri) => (
              <div key={ri} className="flex gap-0.5">
                {row.map((v, ci) => {
                  const isActive = ci === activeC;
                  return (
                    <div
                      key={ci}
                      className={`${CELL} ${CELL_MD} rounded-lg border-2 transition-colors ${
                        isActive
                          ? "bg-green-100 dark:bg-green-500/20 border-green-400"
                          : "bg-card border-border"
                      }`}
                    >
                      {fmt(v)}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="text-2xl text-muted-foreground font-bold">=</div>

        {/* Output matrix C */}
        <div className="text-center">
          <div className="text-xs font-semibold mb-1.5 text-muted-foreground">
            <span className="font-bold text-foreground">C</span>{" "}
            <span className="opacity-60">[3×3]</span>
          </div>
          <div className="space-y-0.5">
            {output.map((row, ri) => (
              <div key={ri} className="flex gap-0.5">
                {row.map((v, ci) => {
                  const isThis = ri === activeR && ci === activeC;
                  return (
                    <div
                      key={ci}
                      onClick={() => setActiveCell([ri, ci])}
                      className={`${CELL} w-20 h-11 rounded-lg border-2 cursor-pointer transition-colors ${
                        isThis
                          ? "bg-red-500 text-white border-red-600"
                          : "bg-green-50 dark:bg-green-500/10 border-border hover:border-red-300 dark:hover:border-red-400/40"
                      }`}
                    >
                      {fmt(v, 3)}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail panel */}
      <DetailPanel
        title={`C[${activeR},${activeC}]`}
        labelA={`row ${activeR} of X`}
        labelB={`col ${activeC} of W<sup>T</sup>`}
        vecA={X[activeR]}
        vecB={activeColVec}
        bias={BIASES[activeC]}
        resultLabel={`C[${activeR},${activeC}]`}
      />
    </div>
  );
}

/* ── Main Chapter Component ──────────────────────────────── */

export function DotProductChapter() {
  return (
    <div className="max-w-4xl mx-auto space-y-16 pb-16">
      {/* Header */}
      <motion.div {...fadeUp}>
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">Dot Product Application</h1>
          <Badge variant="secondary">NN from Scratch</Badge>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Every neural network computation boils down to{" "}
          <strong className="text-foreground">dot products</strong>.{" "}
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm">
            np.dot
          </code>{" "}
          handles three scenarios — vector·vector, matrix·vector, and
          matrix·matrix — and knowing the difference is key to understanding how
          data flows through a network.
        </p>
      </motion.div>

      {/* ── Section 1: Vector × Vector ── */}
      <motion.section className="space-y-6" {...fadeUp}>
        <h2 className="text-2xl font-bold border-b pb-2">
          1. Vector × Vector (Single Neuron)
        </h2>

        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">
              np.dot(w, x)
            </code>{" "}
            multiplies element-wise and sums:{" "}
            <strong className="text-foreground">
              w₁x₁ + w₂x₂ + w₃x₃
            </strong>
            . This is exactly what one neuron computes before adding bias.
          </p>
          <p>
            For two vectors, the dot product is{" "}
            <strong className="text-foreground">commutative</strong>:{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm">
              np.dot(w, x) == np.dot(x, w)
            </code>
            . The result is always a single scalar.
          </p>
        </div>

        <VectorDotViz />

        <CodeBlock
          initialCode={`import numpy as np

x = np.array([1.0, 2.0, 3.0])
w = np.array([0.2, 0.8, -0.5])
b = 0.1

# np.dot multiplies element-wise and sums
dot = np.dot(w, x)
print("w:", w)
print("x:", x)
print("w·x =", dot)
print("w·x + b =", dot + b)

# Commutative for vectors:
print("np.dot(x, w) =", np.dot(x, w), "← same!")`}
        />
      </motion.section>

      {/* ── Section 2: Matrix × Vector ── */}
      <motion.section className="space-y-6" {...fadeUp}>
        <h2 className="text-2xl font-bold border-b pb-2">
          2. Matrix × Vector (Layer)
        </h2>

        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            When{" "}
            <strong className="text-foreground">
              W is a matrix (rows = neurons)
            </strong>
            , each row of W dots with the input vector to produce one output.
            This computes{" "}
            <strong className="text-foreground">
              an entire layer at once
            </strong>
            .
          </p>
          <p>
            Order matters now —{" "}
            <strong className="text-foreground">non-commutative</strong>.{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">
              np.dot(W, x)
            </code>{" "}
            is correct (each row dots with x).{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-red-500">
              np.dot(x, W)
            </code>{" "}
            gives a different result — it treats x as a row vector multiplying
            columns.
          </p>
        </div>

        <MatrixVectorViz />

        <CodeBlock
          initialCode={`import numpy as np

x = np.array([1.0, 2.0, 3.0])
W = np.array([[ 0.2,  0.8, -0.5],
              [ 0.5, -0.91, 0.26],
              [-0.26,-0.27, 0.17]])
b = np.array([0.1, -0.2, 0.05])

# Matrix × vector: each row of W dots with x
z = np.dot(W, x) + b
print("np.dot(W, x) + b =", z)

# Non-commutative! Different result:
z_wrong = np.dot(x, W) + b
print("np.dot(x, W) + b =", z_wrong, "← DIFFERENT!")`}
        />
      </motion.section>

      {/* ── Section 3: Matrix × Matrix ── */}
      <motion.section className="space-y-6" {...fadeUp}>
        <h2 className="text-2xl font-bold border-b pb-2">
          3. Matrix × Matrix (Batch)
        </h2>

        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            In practice we process a{" "}
            <strong className="text-foreground">batch of samples</strong> at
            once. Each row in X is one sample. We need the transpose:{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">
              np.dot(X, W.T) + b
            </code>
            .
          </p>
          <p>
            This is full matrix multiplication — each sample&apos;s row dots
            with each neuron&apos;s weights (columns of W
            <sup>T</sup>). The GPU processes all samples in parallel.
          </p>
        </div>

        <MatrixMatrixViz />

        <CodeBlock
          initialCode={`import numpy as np

X = np.array([[ 1.0,  2.0,  3.0],
              [ 2.0,  5.0, -1.0],
              [-1.5,  2.7,  3.3]])

W = np.array([[ 0.2,  0.8, -0.5],
              [ 0.5, -0.91, 0.26],
              [-0.26,-0.27, 0.17]])

b = np.array([0.1, -0.2, 0.05])

# Batch: X @ W.T + b
# (3,3) · (3,3)^T → (3,3)
output = np.dot(X, W.T) + b
print("X shape:", X.shape)
print("W.T shape:", W.T.shape)
print("Output shape:", output.shape)
print("\\nOutput:")
print(output)`}
        />
      </motion.section>

      {/* ── Summary ── */}
      <motion.section
        className="rounded-xl border-2 border-purple-500/20 bg-purple-500/5 p-6 space-y-3"
        {...fadeUp}
      >
        <h3 className="text-lg font-bold">Three Levels of Dot Product</h3>
        <div className="text-sm space-y-3">
          <p>
            <strong className="text-foreground">Vector · Vector</strong>
            <span className="text-muted-foreground">
              {" "}— multiply matching pairs and add them up. One neuron does
              exactly this to produce a single number.
            </span>
          </p>
          <p>
            <strong className="text-foreground">Matrix · Vector</strong>
            <span className="text-muted-foreground">
              {" "}— each row of the weight matrix dots with the input vector.
              One operation computes an entire layer of neurons at once.
            </span>
          </p>
          <p>
            <strong className="text-foreground">
              Matrix · Matrix
            </strong>
            <span className="text-muted-foreground">
              {" "}— every sample in the batch gets its own row-by-column dot
              product. The GPU processes all samples in parallel — that&apos;s
              why neural networks are fast.
            </span>
          </p>
        </div>
      </motion.section>
    </div>
  );
}
