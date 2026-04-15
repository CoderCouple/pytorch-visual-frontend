export interface TensorData {
  data: number[] | number[][] | number[][][];
  shape: number[];
  dtype: string;
  requires_grad?: boolean;
}

export interface OperationStep {
  title: string;
  description: string;
  output: Record<string, unknown>;
}

export interface OperationResult {
  steps: OperationStep[];
  result: TensorData | null;
  error?: string;
}

export interface OperationParam {
  name: string;
  type: "tensor" | "shape" | "number" | "string" | "select";
  label: string;
  default: unknown;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
}

export interface OperationMeta {
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  description: string;
  formula?: string;
  formulaExplanation?: string;
  code: string;
  params: OperationParam[];
  vizType: string;
}
