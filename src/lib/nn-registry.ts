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
    id: "dot-product-intro",
    name: "Dot Product: Vector × Vector",
    category: "Basics",
    categorySlug: "basics",
    description:
      "A single neuron multiplies each input by its weight and sums the results — that's a dot product. Here we compute it manually element-by-element, then show how np.dot does it in one line.\n• Both vectors must have equal length.\n• Commutative: np.dot(a, b) = np.dot(b, a).",
    formula: "w \\cdot x = \\sum_{i} w_i \\, x_i",
    formulaExplanation:
      "Multiply each weight w_i by its input x_i, then sum: (0.2×1) + (0.8×2) + (−0.5×3) = 0.3. Add bias 0.1 → output 0.4.",
    code: `import numpy as np

x = np.array([1.0, 2.0, 3.0])
w = np.array([0.2, 0.8, -0.5])
bias = 0.1

# ---- Without np.dot ----
z = (w[0]*x[0]) + (w[1]*x[1]) + (w[2]*x[2])
print("Without np.dot:")
print("  (0.2*1) + (0.8*2) + (-0.5*3)")
print("  = 0.2 + 1.6 - 1.5")
print("  =", z)
print("  + bias:", z, "+", bias, "=", z + bias)

# ---- With np.dot (one line!) ----
z = np.dot(w, x) + bias
print("\\nWith np.dot:")
print("  np.dot(w, x) + bias =", z)

# ---- Commutativity: order doesn't matter for vectors ----
print("\\nCommutativity:")
print("  np.dot(w, x) =", np.dot(w, x))
print("  np.dot(x, w) =", np.dot(x, w))
print("  Same result!", np.dot(w, x) == np.dot(x, w))

# For visualization
a = w.reshape(1, 3)
b = x.reshape(3, 1)`,
    params: [],
    vizType: "matmul",
  },
  {
    id: "dot-product-layer",
    name: "Dot Product: Matrix × Vector",
    category: "Basics",
    categorySlug: "basics",
    description:
      "A layer of neurons is just multiple dot products stacked: each row of the weight matrix dots with the input vector to produce one neuron's output. Here we compute each neuron manually, then show how np.dot does the whole layer at once.\n• Matrix columns must equal vector length.\n• Not commutative: np.dot(W, x) ≠ np.dot(x, W).",
    formula: "z = W \\cdot x + b",
    formulaExplanation:
      "Each row of W dots with input x to produce one output. Row 1: (0.2×1)+(0.8×2)+(−0.5×3)+0.1 = 0.4, Row 2: (0.5×1)+(−0.91×2)+(0.26×3)−0.2 = −0.74, Row 3: (−0.26×1)+(−0.27×2)+(0.17×3)+0.05 = −0.24.",
    code: `import numpy as np

x = np.array([1.0, 2.0, 3.0])
W = np.array([[ 0.2,   0.8,  -0.5 ],
              [ 0.5,  -0.91,  0.26],
              [-0.26, -0.27,  0.17]])
bias = np.array([0.1, -0.2, 0.05])

# ---- Without np.dot ----
n1 = (W[0,0]*x[0]) + (W[0,1]*x[1]) + (W[0,2]*x[2]) + bias[0]
n2 = (W[1,0]*x[0]) + (W[1,1]*x[1]) + (W[1,2]*x[2]) + bias[1]
n3 = (W[2,0]*x[0]) + (W[2,1]*x[1]) + (W[2,2]*x[2]) + bias[2]
print("Without np.dot:")
print("  Neuron 1: (0.2*1)+(0.8*2)+(-0.5*3)+0.1  =", round(n1, 2))
print("  Neuron 2: (0.5*1)+(-0.91*2)+(0.26*3)-0.2 =", round(n2, 2))
print("  Neuron 3: (-0.26*1)+(-0.27*2)+(0.17*3)+0.05 =", round(n3, 2))

# ---- With np.dot (one line!) ----
out = np.dot(W, x) + bias
print("\\nWith np.dot:")
print("  np.dot(W, x) + bias =", out)

# ---- Not commutative: np.dot(x, W) would need compatible shapes ----
print("\\nCommutativity:")
print("  np.dot(W, x) works: W is (3,3), x is (3,) -> output (3,)")
print("  np.dot(x, W) also works here (square W), but gives DIFFERENT result:")
print("  np.dot(W, x) =", np.dot(W, x))
print("  np.dot(x, W) =", np.dot(x, W))
print("  Not the same! Order matters for matrix-vector products.")

# For visualization
a = W
b = x.reshape(3, 1)`,
    params: [],
    vizType: "matmul",
  },
  {
    id: "dot-product-batch",
    name: "Dot Product: Matrix × Matrix",
    category: "Basics",
    categorySlug: "basics",
    description:
      "When you have a batch of samples, each sample needs its own layer output. That's a matrix × matrix multiply: each row of X dots with each column of W^T. Here we compute it with a triple loop, then show how np.dot replaces all of it.\n• A's columns must equal B's rows.\n• Not commutative: np.dot(A, B) ≠ np.dot(B, A).",
    formula: "Z = X \\cdot W^T + b",
    formulaExplanation:
      "X is (3 samples × 3 features), W is (3 neurons × 3 features). X · W^T produces a (3 × 3) output where each row is one sample's neuron outputs, then we add bias b to each row.",
    code: `import numpy as np

X = np.array([[ 1.0,  2.0,  3.0],
              [ 2.0,  5.0, -1.0],
              [-1.5,  2.7,  3.3]])
W = np.array([[ 0.2,   0.8,  -0.5 ],
              [ 0.5,  -0.91,  0.26],
              [-0.26, -0.27,  0.17]])
bias = np.array([0.1, -0.2, 0.05])

# ---- Without np.dot (triple loop) ----
result = np.zeros((3, 3))
for i in range(3):          # each sample
    for j in range(3):      # each neuron
        for k in range(3):  # each feature
            result[i,j] += X[i,k] * W[j,k]
        result[i,j] += bias[j]
print("Without np.dot (triple loop):")
print(result)

# ---- With np.dot (one line!) ----
result = np.dot(X, W.T) + bias
print("\\nWith np.dot (one line!):")
print(result)

# ---- Not commutative: np.dot(X, W.T) vs np.dot(W, X.T) ----
print("\\nCommutativity:")
print("  np.dot(X, W.T) shape:", np.dot(X, W.T).shape, "(samples x neurons)")
print("  np.dot(W, X.T) shape:", np.dot(W, X.T).shape, "(neurons x samples)")
print("  np.dot(X, W.T):\\n", np.dot(X, W.T))
print("  np.dot(W, X.T):\\n", np.dot(W, X.T))
print("  Different results! Order matters for matrix multiplication.")

# For visualization
a = X
b = W.T`,
    params: [],
    vizType: "matmul",
  },
  {
    id: "dot-product",
    name: "Dot Product Application",
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
