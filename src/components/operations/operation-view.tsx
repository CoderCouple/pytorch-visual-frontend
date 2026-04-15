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
import { Badge } from "@/components/ui/badge";

// Operations that have specialized step-by-step backend handlers
const STRUCTURED_OPS = new Set(["add", "matmul", "reshape", "relu"]);

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
          return <MathOpViz steps={s} currentStep={currentStep} speed={speed} />;
        case "matmul":
          return <MatmulViz steps={s} currentStep={currentStep} speed={speed} />;
        case "reshape":
          return <ReshapeViz steps={s} currentStep={currentStep} speed={speed} />;
        case "activation":
          return <ActivationViz steps={s} currentStep={currentStep} />;
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
    case "relu": {
      const x = entries.find(([n]) => n === "x")?.[1];
      return { data: x?.data || [[-3, -2, -1, 0, 1, 2, 3]] };
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
