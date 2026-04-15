const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function executeOperation(
  operation: string,
  params: Record<string, unknown>
) {
  const res = await fetch(`${API_BASE}/api/operations/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ operation, params }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export interface RunCodeResult {
  tensors: Record<string, {
    data: number[] | number[][] | number[][][];
    shape: number[];
    dtype: string;
    name: string;
  }>;
  steps: { title: string; description: string; output: Record<string, unknown> }[];
  stdout: string;
  error: string | null;
}

export async function runCode(code: string): Promise<RunCodeResult> {
  const res = await fetch(`${API_BASE}/api/run-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}
