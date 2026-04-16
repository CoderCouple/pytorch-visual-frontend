import { OperationMeta } from "@/types/operations";

export const NN_CHAPTERS: OperationMeta[] = [
  {
    id: "neuron",
    name: "Neuron",
    category: "Basics",
    categorySlug: "basics",
    description:
      "A neuron computes a weighted sum of its inputs, adds a bias, and passes the result through an activation function. It is the fundamental unit of a neural network.",
    formula: "y = f\\left(\\sum_{i} w_i x_i + b\\right)",
    formulaExplanation:
      "Multiply each input x_i by its weight w_i, sum them all, add a bias b, then apply an activation function f (e.g. ReLU or sigmoid).",
    code: `import numpy as np

# A single neuron with 3 inputs
x = np.array([1.0, 2.0, 3.0])     # inputs
w = np.array([0.2, 0.8, -0.5])    # weights
b = 0.1                            # bias

# Weighted sum + bias
z = np.dot(x, w) + b
print("weighted sum + bias:", z)

# Apply activation (ReLU)
y = max(0, z)
print("after activation:", y)`,
    params: [],
    vizType: "linear",
  },
  {
    id: "dot-product",
    name: "Dot Product",
    category: "Basics",
    categorySlug: "basics",
    description:
      "np.dot handles three cases: vector·vector → scalar (single neuron), matrix·vector → vector (layer output), and matrix·matrix → matrix (batch processing). It is the core operation behind every neural network layer.",
    formula: "z = W \\cdot x + b",
    formulaExplanation:
      "Multiply weight matrix W by input x using dot product, then add bias b. For vectors this is element-wise multiply and sum; for matrices each row dots with the input.",
    code: `import numpy as np

a = np.array([1.0, 2.0, 3.0])
b = np.array([4.0, 5.0, 6.0])

# Element-wise multiply then sum
dot = np.dot(a, b)
print("a:", a)
print("b:", b)
print("dot product:", dot)

# Same thing, step by step
products = a * b
print("element-wise products:", products)
print("sum of products:", products.sum())`,
    params: [],
    vizType: "matmul",
  },
];

export function getNNChapter(id: string) {
  return NN_CHAPTERS.find((ch) => ch.id === id);
}
