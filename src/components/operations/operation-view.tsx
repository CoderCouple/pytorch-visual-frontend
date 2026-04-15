"use client";

import { useState, useEffect, useCallback } from "react";
import { OperationMeta, OperationResult, OperationStep } from "@/types/operations";
import { runCode, executeOperation, RunCodeResult } from "@/lib/api";
import { AnimationControls } from "./animation-controls";
import { ExplanationPanel } from "./explanation-panel";
import { MathPanel } from "./math-panel";
import { PythonEditor } from "./python-editor";
import { TensorGrid } from "@/components/visualizations/tensor-grid";
import { MathOpViz } from "@/components/visualizations/math-op-viz";
import { MatmulViz } from "@/components/visualizations/matmul-viz";
import { ReshapeViz } from "@/components/visualizations/reshape-viz";
import { ActivationViz } from "@/components/visualizations/activation-viz";
import { ReductionViz } from "@/components/visualizations/reduction-viz";
import { PermuteViz } from "@/components/visualizations/permute-viz";
import { AutogradViz } from "@/components/visualizations/autograd-viz";
import { SoftmaxViz } from "@/components/visualizations/softmax-viz";
import { LossViz } from "@/components/visualizations/loss-viz";
import { LinearViz } from "@/components/visualizations/linear-viz";
import { ConvViz } from "@/components/visualizations/conv-viz";
import { OptimizerViz } from "@/components/visualizations/optimizer-viz";
import { Badge } from "@/components/ui/badge";

// Operations that have specialized step-by-step backend handlers
const STRUCTURED_OPS = new Set([
  "add", "matmul", "reshape", "relu",
  "view", "mul", "sum", "mean", "permute",
  "autograd", "linear", "conv2d", "softmax",
  "cross_entropy", "mse_loss", "optimizer",
]);

interface OperationViewProps {
  operation: OperationMeta;
}

export function OperationView({ operation }: OperationViewProps) {
  const [code, setCode] = useState(operation.code);
  // For code-runner results (tensor-grid viz)
  const [codeResult, setCodeResult] = useState<RunCodeResult | null>(null);
  // For structured step results (add/matmul/reshape/relu viz)
  const [structuredResult, setStructuredResult] = useState<OperationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const isStructured = STRUCTURED_OPS.has(operation.id);
  const steps = isStructured
    ? (structuredResult?.steps || [])
    : (codeResult?.steps || []);

  // Auto-play steps — but skip auto-advance for vizTypes that manage their own animation
  const selfAnimating = operation.vizType === "matmul" || operation.vizType === "math-op";
  useEffect(() => {
    if (!isPlaying || steps.length === 0) return;
    if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
      return;
    }
    // For self-animating viz types, jump straight to the last step and let the component handle it
    if (selfAnimating && currentStep === 0) {
      setCurrentStep(steps.length - 1);
      return;
    }
    const timer = setTimeout(() => {
      setCurrentStep((s) => s + 1);
    }, 1200 / speed);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed, selfAnimating]);

  const handleRun = useCallback(async () => {
    setLoading(true);
    setError(null);
    setCurrentStep(0);
    setIsPlaying(false);
    try {
      // Always run the code for stdout/tensors display
      const codeRes = await runCode(code);
      setCodeResult(codeRes);
      if (codeRes.error) {
        setError(codeRes.error);
        setLoading(false);
        return;
      }

      // For structured ops, also run the structured executor with parsed params
      if (isStructured) {
        const params = extractParamsFromTensors(operation.id, codeRes.tensors);
        const structRes = await executeOperation(operation.id, params);
        setStructuredResult(structRes);
      }

      setIsPlaying(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to execute");
    } finally {
      setLoading(false);
    }
  }, [code, operation.id, isStructured]);

  // Reset when operation changes
  useEffect(() => {
    setCode(operation.code);
    setCodeResult(null);
    setStructuredResult(null);
    setError(null);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [operation.id]);

  function renderVisualization() {
    if (isStructured && structuredResult) {
      const s = structuredResult.steps;
      switch (operation.vizType) {
        case "math-op":
          if (operation.id === "mul") {
            return <MathOpViz steps={s} currentStep={currentStep} speed={speed} operator="×" label="Multiply" />;
          }
          return <MathOpViz steps={s} currentStep={currentStep} speed={speed} />;
        case "matmul":
          return <MatmulViz steps={s} currentStep={currentStep} speed={speed} />;
        case "reshape":
          return <ReshapeViz steps={s} currentStep={currentStep} speed={speed} />;
        case "activation":
          return <ActivationViz steps={s} currentStep={currentStep} />;
        case "reduction":
          return <ReductionViz steps={s} currentStep={currentStep} speed={speed} />;
        case "permute":
          return <PermuteViz steps={s} currentStep={currentStep} />;
        case "autograd":
          return <AutogradViz steps={s} currentStep={currentStep} />;
        case "softmax":
          return <SoftmaxViz steps={s} currentStep={currentStep} />;
        case "loss":
          return <LossViz steps={s} currentStep={currentStep} opId={operation.id} />;
        case "linear":
          return <LinearViz steps={s} currentStep={currentStep} speed={speed} />;
        case "conv2d":
          return <ConvViz steps={s} currentStep={currentStep} speed={speed} />;
        case "optimizer":
          return <OptimizerViz steps={s} currentStep={currentStep} />;
      }
    }

    // Fallback: render all tensors from code result
    if (codeResult && Object.keys(codeResult.tensors).length > 0) {
      return <TensorResults tensors={codeResult.tensors} currentStep={currentStep} />;
    }

    return null;
  }

  const hasResults = isStructured
    ? structuredResult != null
    : (codeResult != null && Object.keys(codeResult?.tensors || {}).length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-bold font-mono">{operation.name}</h2>
          <Badge variant="secondary">{operation.category}</Badge>
        </div>
        <p className="text-muted-foreground">{operation.description}</p>
      </div>

      <MathPanel formula={operation.formula} explanation={operation.formulaExplanation} />

      {/* Code editor */}
      <PythonEditor
        code={code}
        onChange={setCode}
        onRun={handleRun}
        loading={loading}
        stdout={codeResult?.stdout}
        error={error}
      />

      {/* Visualization */}
      <AnimationControls
        currentStep={currentStep}
        totalSteps={steps.length}
        isPlaying={isPlaying}
        speed={speed}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onNext={() => setCurrentStep((s) => Math.min(s + 1, steps.length - 1))}
        onReset={() => {
          setCurrentStep(0);
          setIsPlaying(false);
        }}
        onSpeedChange={setSpeed}
      />

      <div className="rounded-lg border bg-card p-6 min-h-[350px] flex items-center justify-center overflow-x-auto">
        {hasResults ? (
          renderVisualization()
        ) : (
          <p className="text-muted-foreground text-sm">
            Write Python code and press Shift+Enter or click &quot;Run&quot; to visualize.
          </p>
        )}
      </div>

      {/* Step-by-step */}
      <ExplanationPanel steps={steps} currentStep={currentStep} />
    </div>
  );
}

/* ── Extract params from tensor variables for the structured API ── */

function extractParamsFromTensors(
  opId: string,
  tensors: RunCodeResult["tensors"]
): Record<string, unknown> {
  const entries = Object.entries(tensors);
  switch (opId) {
    case "add": {
      const a = entries.find(([n]) => n === "a")?.[1];
      const b = entries.find(([n]) => n === "b")?.[1];
      const result = entries.find(([n]) => n === "result")?.[1];
      return {
        a: a?.data || [[1, 2], [3, 4]],
        b: b?.data || result?.data || [[10, 20], [30, 40]],
      };
    }
    case "mul": {
      const a = entries.find(([n]) => n === "a")?.[1];
      const b = entries.find(([n]) => n === "b")?.[1];
      return {
        a: a?.data || [[1, 2], [3, 4]],
        b: b?.data || [[10, 20], [30, 40]],
      };
    }
    case "matmul": {
      const a = entries.find(([n]) => n === "a")?.[1];
      const b = entries.find(([n]) => n === "b")?.[1];
      return {
        a: a?.data || [[1, 2], [3, 4]],
        b: b?.data || [[5, 6], [7, 8]],
      };
    }
    case "reshape": {
      const original = entries.find(([n]) => n === "original" || n === "t")?.[1];
      const reshaped = entries.find(([n]) => n === "reshaped" || n === "result")?.[1];
      return {
        data: original?.data || [[1, 2, 3], [4, 5, 6]],
        new_shape: reshaped?.shape || [3, 2],
      };
    }
    case "view": {
      const original = entries.find(([n]) => n === "original" || n === "t")?.[1];
      const viewed = entries.find(([n]) => n === "viewed" || n === "result")?.[1];
      return {
        data: original?.data || [[1, 2, 3], [4, 5, 6]],
        new_shape: viewed?.shape || [3, 2],
      };
    }
    case "permute": {
      const t = entries.find(([n]) => n === "t" || n === "original")?.[1];
      return {
        data: t?.data || [[[1, 2], [3, 4], [5, 6]]],
        dims: [2, 0, 1],
      };
    }
    case "relu": {
      const x = entries.find(([n]) => n === "x")?.[1];
      return { data: x?.data || [[-3, -2, -1, 0, 1, 2, 3]] };
    }
    case "sum": {
      const t = entries.find(([n]) => n === "t" || n === "x")?.[1];
      return { data: t?.data || [[1, 2, 3], [4, 5, 6]], dim: 1 };
    }
    case "mean": {
      const t = entries.find(([n]) => n === "t" || n === "x")?.[1];
      return { data: t?.data || [[1, 2, 3], [4, 5, 6]], dim: 1 };
    }
    case "autograd": {
      const x = entries.find(([n]) => n === "x")?.[1];
      return { x: x?.data || [1.0, 2.0, 3.0] };
    }
    case "linear": {
      const x = entries.find(([n]) => n === "x")?.[1];
      return {
        input: x?.data || [1.0, 2.0, 3.0],
        in_features: x?.shape?.[x.shape.length - 1] || 3,
        out_features: 2,
      };
    }
    case "conv2d": {
      return {
        input: [[1, 2, 3, 0], [4, 5, 6, 1], [7, 8, 9, 2], [0, 1, 2, 3]],
        kernel: [[1, 0], [0, -1]],
      };
    }
    case "softmax": {
      const x = entries.find(([n]) => n === "logits" || n === "x")?.[1];
      return { data: x?.data || [2.0, 1.0, 0.1] };
    }
    case "cross_entropy": {
      const logits = entries.find(([n]) => n === "logits")?.[1];
      const target = entries.find(([n]) => n === "target")?.[1];
      return {
        logits: logits?.data || [2.0, 1.0, 0.1],
        target: target?.data != null ? (Array.isArray(target.data) ? target.data[0] : target.data) : 0,
      };
    }
    case "mse_loss": {
      const pred = entries.find(([n]) => n === "predictions" || n === "pred")?.[1];
      const tgt = entries.find(([n]) => n === "targets" || n === "target")?.[1];
      return {
        predictions: pred?.data || [2.5, 0.5, 2.1, 7.8],
        targets: tgt?.data || [3.0, -0.5, 2.0, 7.5],
      };
    }
    case "optimizer": {
      return { lr: 0.1, num_steps: 5, optimizer: "SGD" };
    }
    default:
      return {};
  }
}

/* ── Render all tensors from code execution ── */

function TensorResults({
  tensors,
  currentStep,
}: {
  tensors: RunCodeResult["tensors"];
  currentStep: number;
}) {
  const entries = Object.entries(tensors);

  return (
    <div className="flex flex-wrap items-start justify-center gap-8 w-full">
      {entries.map(([name, tensor], i) => (
        <div
          key={name}
          className={`transition-opacity duration-300 ${i <= currentStep ? "opacity-100" : "opacity-30"}`}
        >
          <TensorGrid
            data={tensor.data}
            shape={tensor.shape}
            label={name}
            animateIn={i === currentStep}
          />
        </div>
      ))}
    </div>
  );
}
