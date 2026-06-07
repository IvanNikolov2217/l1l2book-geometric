---
title: Regularization — Geometric Interpretation
subtitle: Understanding regularization through shapes and constraint regions
---

This tutorial explains Ridge (L2) and Lasso (L1) regularization through geometry. Instead of working through numbers, we use shapes to build intuition for _why_ the two methods behave differently — and why Lasso sets weights to zero while Ridge does not. Each step builds on the last.

---

## Overview

A regularized model has two competing goals: fit the training data well, and keep the weights small. These two goals pull in opposite directions. Understanding regularization geometrically means understanding _where_ the model ends up when these two forces meet.

::::{grid} 2
:::{card} Ridge — L2
The allowed region for the weights is a **circle**. Its smooth boundary means the solution usually lands away from the axes — both weights are small but nonzero.
:::
:::{card} Lasso — L1
The allowed region for the weights is a **diamond**. Its sharp corners lie exactly on the axes — the solution often lands where one weight is exactly zero.
:::
::::

:::{note} The running example
Throughout this tutorial we work with a model that has exactly **two weights**, $w_1$ and $w_2$. This lets us draw everything as a two-dimensional picture. The same geometric logic applies to models with many more weights.
:::

---

## Step 1 — Two Weights, One Picture

_Setting up the geometric view_

To make regularization visual, imagine a model with only two weights:

```{math}
w_1 \quad \text{and} \quad w_2
```

We can draw these as a point on a plane: the horizontal axis represents $w_1$ and the vertical axis represents $w_2$. Every point on this plane is a different model.

For example:

|   Point   | $w_1$ | $w_2$ | Meaning                             |
| :-------: | ----: | ----: | :---------------------------------- |
| $(2,\ 1)$ |     2 |     1 | Both features have influence        |
| $(0,\ 3)$ |     0 |     3 | First feature is completely ignored |
| $(0,\ 0)$ |     0 |     0 | Neither feature has any influence   |

The point $(0,\ 0)$ is the origin — the most regularized model possible, where every weight is zero. Real solutions will be somewhere between the origin and the unregularized best fit.

:::{note} Why two weights?
With two weights we can draw the problem as a flat picture. With three weights we would need a 3D picture, and with more than three it becomes impossible to visualize directly. The two-weight case captures all the essential geometry.
:::

---

## Step 2 — Loss Contours

_Drawing the training error as a landscape_

The loss function measures how well a set of weights fits the training data. We can draw **contour lines** on our weight plane — curves that connect all points with the same loss value, like elevation lines on a map.

```{math}
\min_{w_1,\, w_2} \;\mathcal{L}(w_1, w_2)
```

The contours are centered on the **unregularized optimum** $\hat{w}$ — the point that fits the training data best with no restrictions on weight size.

:::{note} Reading a contour plot
Each contour is one "elevation" of training error. The center has the lowest error. Moving outward, each ring marks a higher error level. The unregularized solution sits at the center; any regularized solution will be pulled away from it toward the origin.
:::

<iframe src="https://ivannikolov2217.github.io/widgets/widget-loss-contours(1).html" width="100%" height="520" frameborder="0" scrolling="no"></iframe>

**Observe:** Without regularization, the model simply picks the center point. With regularization, it must stay within an allowed region — and the boundary of that region determines where the solution lands.

---

## Step 3 — The Constraint Region

_What does "keep weights small" look like geometrically?_

Regularization restricts how large the weights can be. Geometrically, this means the solution must stay inside a **constraint region** around the origin. The shape of that region depends on whether we use L1 or L2.

The two formulations below are equivalent ways of writing the same problem:

| View           | Expression                                | Reading                            |
| :------------- | :---------------------------------------- | :--------------------------------- |
| **Penalty**    | $\mathcal{L}(w) + \lambda\, R(w)$         | Make large weights expensive       |
| **Constraint** | $\mathcal{L}(w)$ subject to $R(w) \leq c$ | Only allow weights inside a region |

Here $c$ controls the size of the allowed region. A smaller $c$ means a tighter constraint and stronger regularization; a larger $c$ means the model has more freedom.

The regularized solution is always the point where the **lowest reachable loss contour just touches the boundary of the allowed region**.

:::{note} Penalty vs constraint — same result
For every value of $\lambda$ in the penalty formulation, there is a corresponding value of $c$ in the constraint formulation that gives the exact same solution. The two views are mathematically equivalent; the constraint view is simply easier to draw.
:::

---

## Step 4 — L2 Geometry: The Circle

_Why Ridge shrinks but never eliminates weights_

The L2 constraint region is defined by:

```{math}
:label: l2-constraint
w_1^2 + w_2^2 \leq c
```

This is a **circle** centered at the origin. Every point inside the circle satisfies the constraint; every point outside is rejected because the weights are too large.

```{math}
:label: ridge-penalty
\min_{w_1,\, w_2} \;\mathcal{L}(w_1, w_2) \;+\; \lambda\,(w_1^2 + w_2^2)
```

The regularized solution is the point where the smallest possible loss contour first touches the circle.

<iframe src="https://ivannikolov2217.github.io/widgets/widget-region-l2(1).html" width="100%" height="520" frameborder="0" scrolling="no"></iframe>

**Observe:** A circle is smooth — it has no special points on the axes. The loss contour can touch the circle almost anywhere, and in general it does so at a point where both $w_1 \neq 0$ and $w_2 \neq 0$.

```{math}
w_1 \neq 0, \quad w_2 \neq 0
```

This is why Ridge regression almost never produces exactly zero weights. The weights are pulled toward the origin, but there is no geometric reason for them to land precisely on an axis.

:::{note} Why does squaring the weights work?
The penalty $w_j^2$ grows very fast as weights get larger. A weight of 100 incurs a penalty 100× bigger than a weight of 10. This strongly discourages large values and pushes the solution toward the smooth, round boundary of the circle.
:::

---

## Step 5 — L1 Geometry: The Diamond

_Why Lasso sets weights to exactly zero_

The L1 constraint region is defined by:

```{math}
:label: l1-constraint
|w_1| + |w_2| \leq c
```

This forms a **diamond** (a square rotated 45°) centered at the origin. The regularized solution is again the point where the smallest loss contour first touches the boundary.

```{math}
:label: lasso-penalty
\min_{w_1,\, w_2} \;\mathcal{L}(w_1, w_2) \;+\; \lambda\,(|w_1| + |w_2|)
```

The critical difference from L2 is that the diamond has **sharp corners**, and those corners lie exactly on the axes — at points like $(c,\ 0)$, $(-c,\ 0)$, $(0,\ c)$, and $(0,\ -c)$.

When the loss contour sweeps inward from the unregularized optimum, it is geometrically likely to first touch one of these corners. The reason is that the corners stick out furthest along the axes: an incoming contour reaches a protruding corner before it reaches the flatter edges between corners, unless the optimum happens to be oriented so that an edge is reached first. At a corner on the horizontal axis, $w_2 = 0$ exactly. At a corner on the vertical axis, $w_1 = 0$ exactly.

```{math}
w_1 = 0 \quad \text{or} \quad w_2 = 0
```

<iframe src="https://ivannikolov2217.github.io/widgets/widget-region-l1(1).html" width="100%" height="520" frameborder="0" scrolling="no"></iframe>

:::{note} Why does the absolute value create corners?
The absolute value function $|w|$ has a sharp kink at $w = 0$ — its derivative is $-1$ for negative values and $+1$ for positive values, with no defined derivative at zero. This kink is what creates the corners of the diamond. It is also why Lasso cannot be minimized analytically — the loss surface is not smooth everywhere.
:::

**Observe:** The closer the unregularized optimum is to one of the axes, the more likely the loss contour is to hit a corner first. In practice, with many features, some of them genuinely unimportant, this happens frequently — Lasso naturally zeroes out the weights that contribute least.

---

## Step 6 — Side by Side

_The shape determines the behaviour_

The interactive explorer below brings everything together. Toggle between the Ridge circle and the Lasso diamond, move the unregularized optimum around its path with the position slider, and grow the loss contour with the λ slider. Watch where the contour touches the boundary: on the circle it lands off-axis, while on the diamond it tends to snap to a corner — setting one weight to exactly zero.

<iframe src="https://ivannikolov2217.github.io/widgets/widget-constraint-region(1).html" width="100%" height="600" frameborder="0" scrolling="no"></iframe>

:::{tip} Try it: Constraint Region Explorer
Move the optimum close to one of the axes and switch to Lasso — notice how readily the touch point lands on a corner (the path turns green). Then switch to Ridge from the same position and watch the touch point stay off the axis (the path stays yellow).
:::

The entire difference between Ridge and Lasso comes down to the shape of the constraint region.

| Property                     | L2 — Ridge                     | L1 — Lasso                                      |
| :--------------------------- | :----------------------------- | :---------------------------------------------- |
| **Constraint region**        | Circle — smooth boundary       | Diamond — sharp corners on axes                 |
| **Where the solution lands** | Off-axis point on the boundary | Often at a corner                               |
| **Weights at the solution**  | Both small, neither zero       | One or more exactly zero                        |
| **Effect**                   | Shrinks all weights            | Eliminates some weights entirely                |
| **Also known as**            | Tikhonov regression            | Least Absolute Shrinkage and Selection Operator |

```{math}
\text{L2} \;\Rightarrow\; \text{small but nonzero weights}
```

```{math}
\text{L1} \;\Rightarrow\; \text{sparse weights — some exactly zero}
```

:::{important} The key geometric insight
L2 uses a smooth shape. L1 uses a shape with corners on the axes. Corners create the possibility of exact zeros. That single geometric difference explains why Lasso performs feature selection and Ridge does not.
:::

---

## Step 7 — Choosing $\lambda$

_The hyperparameter that controls the size of the constraint region_

The parameter $\lambda$ controls how large the constraint region is allowed to be. In the constraint view, $\lambda$ maps directly to $c$ — a larger $\lambda$ corresponds to a smaller $c$, meaning the region shrinks and the weights are forced closer to the origin.

::::{grid} 2
:::{card} $\lambda$ too small (near zero)
The constraint region is very large. The solution can sit close to the unregularized optimum — the model can still overfit.
:::
:::{card} $\lambda$ too large
The constraint region shrinks toward the origin. The solution is forced so close to $(0,\ 0)$ that the model loses all predictive power — it underfits.
:::
::::

The standard approach is to try several values and evaluate each on a **validation set** — data not used during training. Choose the $\lambda$ that gives the lowest validation error.

:::{important} The constraint only applies during training

$$
\text{Training:}\quad \min_w\; \mathcal{L}(w) + \lambda\, R(w)
$$

$$
\text{Evaluation:}\quad \text{measure } \mathcal{L}(w) \text{ only — no penalty}
$$

Once the weights are learned, predictions are made using the standard formula. The regularization term is discarded.
:::

---

## L1 vs L2 — Summary

Both methods restrict how large the weights can be, but the shape of the restriction leads to fundamentally different behaviour.

|                       | **Ridge (L2)**                                         | **Lasso (L1)**                               |
| --------------------- | ------------------------------------------------------ | -------------------------------------------- |
| **Penalty**           | $\lambda \sum w_j^2$                                   | $\lambda \sum \|w_j\|$                       |
| **Constraint shape**  | Circle — smooth                                        | Diamond — corners on axes                    |
| **Effect on weights** | Shrinks all toward zero, none exactly zero             | Shrinks weights; sets some to _exactly_ zero |
| **Feature selection** | No — keeps all features                                | Yes — eliminates irrelevant features         |
| **Best for**          | Many features that all contribute; correlated features | Many features, most of which are irrelevant  |
| **Can be solved**     | Analytically (closed form) or gradient descent         | Gradient descent only (not analytically)     |
