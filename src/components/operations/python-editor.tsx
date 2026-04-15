"use client";

import { useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, Terminal } from "lucide-react";

interface PythonEditorProps {
  code: string;
  onChange: (code: string) => void;
  onRun: () => void;
  loading?: boolean;
  stdout?: string;
  error?: string | null;
}

export function PythonEditor({
  code,
  onChange,
  onRun,
  loading,
  stdout,
  error,
}: PythonEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Shift+Enter = Run
      if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        onRun();
        return;
      }
      // Tab = indent
      if (e.key === "Tab") {
        e.preventDefault();
        const ta = e.currentTarget;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const val = ta.value;
        const newVal = val.substring(0, start) + "    " + val.substring(end);
        onChange(newVal);
        // Restore cursor
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = start + 4;
        });
      }
    },
    [onChange, onRun]
  );

  const lineCount = code.split("\n").length;

  return (
    <div className="flex flex-col rounded-lg border overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-zinc-800 px-4 py-2">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-zinc-400" />
          <span className="text-xs text-zinc-400 font-mono">Python</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-500">Shift+Enter to run</span>
          <Button
            size="sm"
            className="h-7 px-3 text-xs gap-1 bg-[#EE4C2C] hover:bg-[#d4411f] text-white"
            onClick={onRun}
            disabled={loading}
          >
            <Play className="h-3 w-3" />
            {loading ? "Running..." : "Run"}
          </Button>
        </div>
      </div>

      {/* Editor area with line numbers */}
      <div className="flex bg-zinc-900 font-mono text-sm">
        {/* Line numbers */}
        <div className="select-none text-right pr-3 pl-3 py-3 text-zinc-600 text-xs leading-[1.65rem] border-r border-zinc-700/50 min-w-[3rem]">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Code textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className="flex-1 bg-transparent text-zinc-100 p-3 resize-none focus:outline-none min-h-[200px] leading-[1.65rem] text-xs placeholder:text-zinc-600"
          placeholder="import torch&#10;&#10;x = torch.tensor([1, 2, 3])"
        />
      </div>

      {/* Output panel */}
      {(stdout || error) && (
        <div className="border-t border-zinc-700 bg-zinc-950 px-4 py-3 font-mono text-xs max-h-[150px] overflow-auto">
          {error && (
            <div className="text-red-400 whitespace-pre-wrap">{error}</div>
          )}
          {stdout && !error && (
            <div className="text-emerald-400 whitespace-pre-wrap">{stdout}</div>
          )}
        </div>
      )}
    </div>
  );
}
