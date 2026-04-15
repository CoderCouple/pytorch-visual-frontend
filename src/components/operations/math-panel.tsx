"use client";

import { useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface MathPanelProps {
  formula?: string;
  explanation?: string;
}

export function MathPanel({ formula, explanation }: MathPanelProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && formula) {
      katex.render(formula, ref.current, {
        throwOnError: false,
        displayMode: true,
      });
    }
  }, [formula]);

  if (!formula) return null;

  return (
    <div className="rounded-lg border bg-card p-4 space-y-2">
      <div ref={ref} className="text-center" />
      {explanation && (
        <p className="text-sm text-muted-foreground text-center max-w-xl mx-auto leading-relaxed">
          {explanation}
        </p>
      )}
    </div>
  );
}
