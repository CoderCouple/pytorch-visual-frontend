"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipForward, RotateCcw } from "lucide-react";

interface AnimationControlsProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
}

export function AnimationControls({
  currentStep,
  totalSteps,
  isPlaying,
  speed,
  onPlay,
  onPause,
  onNext,
  onReset,
  onSpeedChange,
}: AnimationControlsProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
      <div className="flex items-center gap-1">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={isPlaying ? onPause : onPlay}
          disabled={totalSteps === 0}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={onNext}
          disabled={currentStep >= totalSteps - 1}
        >
          <SkipForward className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onReset}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-xs text-muted-foreground min-w-[80px]">
        Step {totalSteps > 0 ? currentStep + 1 : 0} / {totalSteps}
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <span className="text-xs text-muted-foreground whitespace-nowrap">Speed</span>
        <div className="flex items-center gap-1">
          {[0.5, 1, 1.5, 2, 3].map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-2 py-1 text-xs rounded font-mono transition-colors ${
                speed === s
                  ? "bg-[#EE4C2C] text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
