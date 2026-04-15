import { OperationMeta } from "@/types/operations";

export const CATEGORIES = [
  { name: "Tensor Basics", slug: "tensor-basics" },
  { name: "Math Operations", slug: "math-ops" },
  { name: "Linear Algebra", slug: "linalg" },
  { name: "Reshaping", slug: "reshaping" },
  { name: "Indexing", slug: "indexing" },
  { name: "Activations", slug: "activations" },
] as const;

export const OPERATIONS: OperationMeta[] = [
  // Tensor Basics
  {
    id: "tensor_create",
    name: "torch.tensor()",
    category: "Tensor Basics",
    categorySlug: "tensor-basics",
    description: "Create a tensor from a Python list or nested list. Supports 1D, 2D, and 3D.",
    formula: "T = \\text{tensor}(data)",
    code: `import torch

# 1D tensor
a = torch.tensor([1, 2, 3, 4, 5])

# 2D tensor
b = torch.tensor([[1, 2, 3],
                   [4, 5, 6]])

# 3D tensor
c = torch.tensor([[[1, 2], [3, 4]],
                   [[5, 6], [7, 8]]])`,
    params: [],
    vizType: "tensor-grid",
  },
  {
    id: "tensor_zeros",
    name: "torch.zeros()",
    category: "Tensor Basics",
    categorySlug: "tensor-basics",
    description: "Create a tensor filled with zeros.",
    formula: "T_{ij} = 0",
    code: `import torch

# 1D zeros
z1 = torch.zeros(5)

# 2D zeros
z2 = torch.zeros(3, 4)

# 3D zeros
z3 = torch.zeros(2, 3, 4)`,
    params: [],
    vizType: "tensor-grid",
  },
  {
    id: "tensor_ones",
    name: "torch.ones()",
    category: "Tensor Basics",
    categorySlug: "tensor-basics",
    description: "Create a tensor filled with ones.",
    formula: "T_{ij} = 1",
    code: `import torch

ones_1d = torch.ones(6)
ones_2d = torch.ones(3, 3)
ones_3d = torch.ones(2, 2, 3)`,
    params: [],
    vizType: "tensor-grid",
  },
  {
    id: "tensor_rand",
    name: "torch.rand()",
    category: "Tensor Basics",
    categorySlug: "tensor-basics",
    description: "Create a tensor with uniform random values in [0, 1).",
    formula: "T_{ij} \\sim U(0, 1)",
    code: `import torch

r1 = torch.rand(8)
r2 = torch.rand(4, 4)
r3 = torch.rand(2, 3, 3)`,
    params: [],
    vizType: "tensor-grid",
  },
  {
    id: "tensor_arange",
    name: "torch.arange()",
    category: "Tensor Basics",
    categorySlug: "tensor-basics",
    description: "Create a 1D tensor with evenly spaced values, then optionally reshape.",
    formula: "T_i = \\text{start} + i \\cdot \\text{step}",
    code: `import torch

# 1D range
a = torch.arange(0, 10)

# Reshape into 2D
b = torch.arange(1, 13).reshape(3, 4)

# Reshape into 3D
c = torch.arange(24).reshape(2, 3, 4)`,
    params: [],
    vizType: "tensor-grid",
  },
  // Math Operations
  {
    id: "add",
    name: "torch.add()",
    category: "Math Operations",
    categorySlug: "math-ops",
    description: "Element-wise addition of two tensors with broadcasting support.",
    formula: "C_{ij} = A_{ij} + B_{ij}",
    formulaExplanation: "Each element in the result is the sum of the corresponding elements from A and B at the same position [i, j].",
    code: `import torch

a = torch.tensor([[1, 2], [3, 4]])
b = torch.tensor([[10, 20], [30, 40]])
result = torch.add(a, b)
print(result)`,
    params: [],
    vizType: "math-op",
  },
  // Linear Algebra
  {
    id: "matmul",
    name: "torch.matmul()",
    category: "Linear Algebra",
    categorySlug: "linalg",
    description: "Matrix multiplication. For 2D tensors, computes row x column dot products.",
    formula: "C_{ij} = \\sum_k A_{ik} \\cdot B_{kj}",
    formulaExplanation: "For each output cell [i,j]: take row i from A and column j from B, multiply them element-wise, and sum all the products.",
    code: `import torch

a = torch.tensor([[1, 2], [3, 4]])
b = torch.tensor([[5, 6], [7, 8]])
result = torch.matmul(a, b)
print(result)`,
    params: [],
    vizType: "matmul",
  },
  // Reshaping
  {
    id: "reshape",
    name: "torch.reshape()",
    category: "Reshaping",
    categorySlug: "reshaping",
    description: "Rearrange tensor elements into a new shape without changing data.",
    formula: "\\text{reshape}(T, \\text{new\\_shape})",
    formulaExplanation: "Reads elements in row-major order (left to right, top to bottom) and fills them into the new shape in the same order.",
    code: `import torch

original = torch.arange(1, 13).reshape(3, 4)
reshaped = original.reshape(2, 6)
as_3d = original.reshape(2, 2, 3)
print(original)
print(reshaped)
print(as_3d)`,
    params: [],
    vizType: "reshape",
  },
  // Indexing
  {
    id: "indexing",
    name: "Indexing & Slicing",
    category: "Indexing",
    categorySlug: "indexing",
    description: "Select elements from a tensor using indices and slices.",
    code: `import torch

t = torch.arange(1, 10).reshape(3, 3)
row = t[0]           # first row
col = t[:, 1]        # second column
block = t[0:2, 1:]   # sub-block
print(t)
print(row)
print(block)`,
    params: [],
    vizType: "tensor-grid",
  },
  // Activations
  {
    id: "relu",
    name: "nn.ReLU()",
    category: "Activations",
    categorySlug: "activations",
    description: "Rectified Linear Unit — zeroes out negative values.",
    formula: "\\text{ReLU}(x) = \\max(0, x)",
    formulaExplanation: "If the input is positive, pass it through unchanged. If negative, replace it with zero.",
    code: `import torch
import torch.nn.functional as F

x = torch.tensor([-3, -2, -1, 0, 1, 2, 3], dtype=torch.float)
result = F.relu(x)
print(result)`,
    params: [],
    vizType: "activation",
  },
];

export function getOperationsByCategory(categorySlug: string) {
  return OPERATIONS.filter((op) => op.categorySlug === categorySlug);
}

export function getOperation(id: string) {
  return OPERATIONS.find((op) => op.id === id);
}
