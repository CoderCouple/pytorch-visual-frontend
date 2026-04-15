import { OperationMeta } from "@/types/operations";

export const CATEGORIES = [
  { name: "Tensor Basics", slug: "tensor-basics" },
  { name: "Math Operations", slug: "math-ops" },
  { name: "Linear Algebra", slug: "linalg" },
  { name: "Reshaping", slug: "reshaping" },
  { name: "Indexing", slug: "indexing" },
  { name: "Activations", slug: "activations" },
  { name: "Autograd", slug: "autograd" },
  { name: "NN Layers", slug: "nn-layers" },
  { name: "Loss Functions", slug: "loss" },
  { name: "Optimization", slug: "optimization" },
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
  {
    id: "shape_size",
    name: "Tensor.shape / .size()",
    category: "Tensor Basics",
    categorySlug: "tensor-basics",
    description: "Inspect tensor dimensions: shape, size, ndim, and numel.",
    code: `import torch

t = torch.arange(1, 13).reshape(3, 4)
print("shape:", t.shape)
print("size:", t.size())
print("ndim:", t.ndim)
print("numel:", t.numel())`,
    params: [],
    vizType: "tensor-grid",
  },
  {
    id: "unsqueeze_squeeze",
    name: "unsqueeze() / squeeze()",
    category: "Tensor Basics",
    categorySlug: "tensor-basics",
    description: "Add or remove dimensions of size 1 from a tensor.",
    code: `import torch

t = torch.tensor([[1, 2, 3],
                   [4, 5, 6]])
unsqueezed = t.unsqueeze(0)
squeezed = unsqueezed.squeeze(0)
print("original:", t.shape)
print("unsqueezed:", unsqueezed.shape)
print("squeezed:", squeezed.shape)`,
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
  {
    id: "mul",
    name: "torch.mul()",
    category: "Math Operations",
    categorySlug: "math-ops",
    description: "Element-wise multiplication of two tensors with broadcasting support.",
    formula: "C_{ij} = A_{ij} \\times B_{ij}",
    formulaExplanation: "Each element in the result is the product of the corresponding elements from A and B.",
    code: `import torch

a = torch.tensor([[1, 2], [3, 4]])
b = torch.tensor([[10, 20], [30, 40]])
result = torch.mul(a, b)
print(result)`,
    params: [],
    vizType: "math-op",
  },
  {
    id: "sum",
    name: "torch.sum()",
    category: "Math Operations",
    categorySlug: "math-ops",
    description: "Sum tensor elements along a dimension, reducing that axis.",
    formula: "y_i = \\sum_j x_{ij}",
    formulaExplanation: "Sum all values along the specified dimension, collapsing it.",
    code: `import torch

t = torch.tensor([[1, 2, 3],
                   [4, 5, 6]])
row_sum = t.sum(dim=1)
col_sum = t.sum(dim=0)
print("row sum:", row_sum)
print("col sum:", col_sum)`,
    params: [],
    vizType: "reduction",
  },
  {
    id: "mean",
    name: "torch.mean()",
    category: "Math Operations",
    categorySlug: "math-ops",
    description: "Compute the mean of tensor elements along a dimension.",
    formula: "y_i = \\frac{1}{n} \\sum_j x_{ij}",
    formulaExplanation: "Average all values along the specified dimension.",
    code: `import torch

t = torch.tensor([[1.0, 2.0, 3.0],
                   [4.0, 5.0, 6.0]])
row_mean = t.mean(dim=1)
col_mean = t.mean(dim=0)
print("row mean:", row_mean)
print("col mean:", col_mean)`,
    params: [],
    vizType: "reduction",
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
  {
    id: "view",
    name: "Tensor.view()",
    category: "Reshaping",
    categorySlug: "reshaping",
    description: "Returns a new tensor with the same data but a different shape. Requires contiguous memory.",
    formula: "\\text{view}(T, \\text{new\\_shape})",
    formulaExplanation: "Like reshape, but requires the tensor to be stored contiguously in memory.",
    code: `import torch

original = torch.arange(1, 13).reshape(3, 4)
viewed = original.view(2, 6)
print(original)
print(viewed)`,
    params: [],
    vizType: "reshape",
  },
  {
    id: "permute",
    name: "Tensor.permute()",
    category: "Reshaping",
    categorySlug: "reshaping",
    description: "Rearrange the dimensions (axes) of a tensor.",
    formula: "\\text{permute}(T, dims)",
    formulaExplanation: "Reorder the axes of the tensor. For a 3D tensor with shape [A, B, C], permute(2, 0, 1) gives shape [C, A, B].",
    code: `import torch

t = torch.arange(24).reshape(2, 3, 4)
result = t.permute(2, 0, 1)
print("original shape:", t.shape)
print("permuted shape:", result.shape)`,
    params: [],
    vizType: "permute",
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
  {
    id: "softmax",
    name: "Softmax",
    category: "Activations",
    categorySlug: "activations",
    description: "Convert logits to probabilities that sum to 1.",
    formula: "\\text{softmax}(x_i) = \\frac{e^{x_i}}{\\sum_j e^{x_j}}",
    formulaExplanation: "Exponentiate each value, then divide by the total to get a probability distribution.",
    code: `import torch
import torch.nn.functional as F

logits = torch.tensor([2.0, 1.0, 0.1])
probs = F.softmax(logits, dim=0)
print("logits:", logits)
print("probabilities:", probs)
print("sum:", probs.sum())`,
    params: [],
    vizType: "softmax",
  },
  // Autograd
  {
    id: "autograd",
    name: "Autograd",
    category: "Autograd",
    categorySlug: "autograd",
    description: "Automatic differentiation — compute gradients via backpropagation.",
    formula: "\\frac{\\partial z}{\\partial x} = 2x",
    formulaExplanation: "For z = sum(x²), the gradient dz/dx = 2x by the chain rule.",
    code: `import torch

x = torch.tensor([1.0, 2.0, 3.0], requires_grad=True)
y = x ** 2
z = y.sum()
z.backward()
print("x:", x)
print("x.grad:", x.grad)`,
    params: [],
    vizType: "autograd",
  },
  // NN Layers
  {
    id: "linear",
    name: "nn.Linear()",
    category: "NN Layers",
    categorySlug: "nn-layers",
    description: "Fully connected layer: y = xW^T + b. The fundamental building block of neural networks.",
    formula: "y = xW^T + b",
    formulaExplanation: "Multiply input by a weight matrix (transposed) and add a bias vector.",
    code: `import torch
import torch.nn as nn

torch.manual_seed(42)
layer = nn.Linear(3, 2)
x = torch.tensor([1.0, 2.0, 3.0])
output = layer(x)
print("input:", x)
print("weight:", layer.weight)
print("bias:", layer.bias)
print("output:", output)`,
    params: [],
    vizType: "linear",
  },
  {
    id: "conv2d",
    name: "F.conv2d()",
    category: "NN Layers",
    categorySlug: "nn-layers",
    description: "2D convolution — slide a kernel over an input, computing element-wise products and summing.",
    formula: "\\text{out}_{ij} = \\sum_{m,n} \\text{input}_{i+m,j+n} \\cdot \\text{kernel}_{mn}",
    formulaExplanation: "At each position, multiply the overlapping patch by the kernel and sum all products.",
    code: `import torch
import torch.nn.functional as F

input = torch.tensor([[1, 2, 3, 0],
                       [4, 5, 6, 1],
                       [7, 8, 9, 2],
                       [0, 1, 2, 3]], dtype=torch.float)
kernel = torch.tensor([[1, 0],
                        [0, -1]], dtype=torch.float)
result = F.conv2d(
    input.unsqueeze(0).unsqueeze(0),
    kernel.unsqueeze(0).unsqueeze(0)
).squeeze()
print("result:", result)`,
    params: [],
    vizType: "conv2d",
  },
  // Loss Functions
  {
    id: "cross_entropy",
    name: "CrossEntropyLoss",
    category: "Loss Functions",
    categorySlug: "loss",
    description: "Combines softmax and negative log-likelihood loss for classification.",
    formula: "L = -\\log(p_{target})",
    formulaExplanation: "Apply softmax to get probabilities, then take the negative log of the target class probability.",
    code: `import torch
import torch.nn.functional as F

logits = torch.tensor([2.0, 1.0, 0.1])
target = torch.tensor(0)
loss = F.cross_entropy(logits.unsqueeze(0), target.unsqueeze(0))
print("logits:", logits)
print("target class:", target.item())
print("loss:", loss.item())`,
    params: [],
    vizType: "loss",
  },
  {
    id: "mse_loss",
    name: "MSELoss",
    category: "Loss Functions",
    categorySlug: "loss",
    description: "Mean Squared Error — average of squared differences between predictions and targets.",
    formula: "\\text{MSE} = \\frac{1}{n} \\sum_i (\\hat{y}_i - y_i)^2",
    formulaExplanation: "For each element, compute the squared difference, then average them all.",
    code: `import torch
import torch.nn.functional as F

predictions = torch.tensor([2.5, 0.5, 2.1, 7.8])
targets = torch.tensor([3.0, -0.5, 2.0, 7.5])
loss = F.mse_loss(predictions, targets)
print("predictions:", predictions)
print("targets:", targets)
print("MSE loss:", loss.item())`,
    params: [],
    vizType: "loss",
  },
  // Optimization
  {
    id: "optimizer",
    name: "SGD / Adam Optimizer",
    category: "Optimization",
    categorySlug: "optimization",
    description: "Minimize a loss function by iteratively updating parameters using gradients.",
    formula: "w_{t+1} = w_t - \\eta \\cdot \\nabla L(w_t)",
    formulaExplanation: "Update the weight by subtracting the learning rate times the gradient of the loss.",
    code: `import torch

w = torch.tensor([0.0], requires_grad=True)
optimizer = torch.optim.SGD([w], lr=0.1)

for step in range(5):
    loss = (w - 3) ** 2
    loss.backward()
    print(f"step {step}: w={w.item():.4f}, loss={loss.item():.4f}, grad={w.grad.item():.4f}")
    optimizer.step()
    optimizer.zero_grad()`,
    params: [],
    vizType: "optimizer",
  },
];

export function getOperationsByCategory(categorySlug: string) {
  return OPERATIONS.filter((op) => op.categorySlug === categorySlug);
}

export function getOperation(id: string) {
  return OPERATIONS.find((op) => op.id === id);
}
