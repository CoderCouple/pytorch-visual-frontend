"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OperationParam } from "@/types/operations";
import { Shuffle, Layers, Grid2X2, Minus } from "lucide-react";

interface InputControlsProps {
  params: OperationParam[];
  values: Record<string, unknown>;
  onChange: (name: string, value: unknown) => void;
  onRun: () => void;
  loading?: boolean;
}

export function InputControls({ params, values, onChange, onRun, loading }: InputControlsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Inputs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {params.map((param) => (
          <div key={param.name} className="space-y-1.5">
            <Label className="text-xs font-medium">{param.label}</Label>
            {param.type === "tensor" && (
              <TensorInput
                value={values[param.name] as number | number[] | number[][] | number[][][]}
                onChange={(v) => onChange(param.name, v)}
              />
            )}
            {param.type === "shape" && (
              <ShapeInput
                value={values[param.name] as number[]}
                onChange={(v) => onChange(param.name, v)}
              />
            )}
            {param.type === "string" && (
              <Input
                value={String(values[param.name] || "")}
                onChange={(e) => onChange(param.name, e.target.value)}
                className="font-mono text-xs"
              />
            )}
          </div>
        ))}
        <Button onClick={onRun} disabled={loading} className="w-full bg-[#EE4C2C] hover:bg-[#d4411f] text-white">
          {loading ? "Running..." : "Run Operation"}
        </Button>
      </CardContent>
    </Card>
  );
}

type TensorValue = number | number[] | number[][] | number[][][];

function detectNdim(value: TensorValue): number {
  if (typeof value === "number") return 0;
  if (value.length === 0) return 1;
  if (typeof value[0] === "number") return 1;
  if (Array.isArray(value[0]) && (value[0].length === 0 || typeof value[0][0] === "number")) return 2;
  return 3;
}

function randomFill(shape: number[]): TensorValue {
  if (shape.length === 1) {
    return Array.from({ length: shape[0] }, () => Math.round(Math.random() * 18 - 9));
  }
  if (shape.length === 2) {
    return Array.from({ length: shape[0] }, () =>
      Array.from({ length: shape[1] }, () => Math.round(Math.random() * 18 - 9))
    );
  }
  // 3D
  return Array.from({ length: shape[0] }, () =>
    Array.from({ length: shape[1] }, () =>
      Array.from({ length: shape[2] }, () => Math.round(Math.random() * 18 - 9))
    )
  );
}

const DIM_PRESETS: { ndim: number; label: string; icon: React.ReactNode; shape: number[] }[] = [
  { ndim: 1, label: "1D", icon: <Minus className="h-3 w-3" />, shape: [6] },
  { ndim: 2, label: "2D", icon: <Grid2X2 className="h-3 w-3" />, shape: [3, 4] },
  { ndim: 3, label: "3D", icon: <Layers className="h-3 w-3" />, shape: [2, 3, 4] },
];

function TensorInput({
  value,
  onChange,
}: {
  value: TensorValue;
  onChange: (v: TensorValue) => void;
}) {
  const [text, setText] = useState(JSON.stringify(value, null, 1));

  // Sync text when value changes externally (e.g. preset clicked)
  useEffect(() => {
    setText(JSON.stringify(value, null, 1));
  }, [value]);

  const ndim = detectNdim(value);

  function handleBlur() {
    try {
      const parsed = JSON.parse(text);
      onChange(parsed);
    } catch {
      setText(JSON.stringify(value, null, 1));
    }
  }

  function handlePreset(preset: typeof DIM_PRESETS[number]) {
    const newVal = randomFill(preset.shape);
    onChange(newVal);
  }

  function handleRandomize() {
    const shape = getShape(value);
    const newVal = randomFill(shape);
    onChange(newVal);
  }

  return (
    <div className="space-y-2">
      {/* Dimension presets */}
      <div className="flex items-center gap-1.5">
        {DIM_PRESETS.map((preset) => (
          <Button
            key={preset.ndim}
            type="button"
            size="sm"
            variant={ndim === preset.ndim ? "default" : "outline"}
            className="h-7 px-2 text-xs gap-1"
            onClick={() => handlePreset(preset)}
          >
            {preset.icon}
            {preset.label}
          </Button>
        ))}
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 px-2 text-xs gap-1 ml-auto"
          onClick={handleRandomize}
        >
          <Shuffle className="h-3 w-3" />
          Random
        </Button>
      </div>

      {/* JSON editor */}
      <textarea
        className="w-full rounded-md border bg-background px-3 py-2 font-mono text-xs min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-ring"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        spellCheck={false}
      />

      {/* Shape display */}
      <div className="text-[10px] text-muted-foreground font-mono">
        shape: [{getShape(value).join(", ")}] &middot; {ndim}D tensor
      </div>
    </div>
  );
}

function ShapeInput({
  value,
  onChange,
}: {
  value: number[];
  onChange: (v: number[]) => void;
}) {
  const [text, setText] = useState(value.join(", "));

  useEffect(() => {
    setText(value.join(", "));
  }, [value]);

  function handleBlur() {
    const nums = text.split(",").map((s) => parseInt(s.trim())).filter((n) => !isNaN(n) && n > 0);
    if (nums.length > 0) onChange(nums);
    else setText(value.join(", "));
  }

  return (
    <div className="space-y-1">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        placeholder="e.g. 3, 3 or 2, 3, 4"
        className="font-mono text-xs"
      />
      <div className="text-[10px] text-muted-foreground">
        {value.length}D &middot; {value.reduce((a, b) => a * b, 1)} elements
      </div>
    </div>
  );
}

function getShape(val: TensorValue): number[] {
  if (typeof val === "number") return [];
  if (val.length === 0) return [0];
  if (typeof val[0] === "number") return [val.length];
  const inner = val[0] as TensorValue;
  return [val.length, ...getShape(inner)];
}
