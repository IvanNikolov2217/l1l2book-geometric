---
title: Regularization - Worked Example
subtitle: A Step-by-Step Tutorial
---

# Algebraic form

## Overview

Before diving in, let's revisit the problem regularization solves. When a linear model has many features - especially correlated ones - it tends to assign very large weights to some of them in order to fit the training data closely. This produces a model that is _unnecessarily complex_ and _generalizes poorly_ to new data. This is called **overfitting**.

Regularization addresses this by adding a **penalty term** to the loss function. This penalty grows as the weights get larger, so the model is forced to keep them small. A simpler model with smaller weights usually generalizes better.

::::{grid} 2
:::{card} Ridge - L2
Penalizes the **square** of each weight. All weights shrink toward zero, but none are forced to be exactly zero. Good when all features contribute something.
:::
:::{card} Lasso - L1
Penalizes the **absolute value** of each weight. Some weights are forced to exactly zero. Performs automatic feature selection - particularly useful with many features.
:::
::::

:::{note} The running example
Throughout this tutorial we predict **salary (in \$k)** from **age**, using a 5th-degree polynomial fitted to 10 training examples. This model overfits badly - as you will see below. Regularization will show us how to fix it.
:::

## Step 1 - The Example

_Predicting salary from age - the data and the fitted model_

We have 10 observations. Each person has a known age ($x$) and salary ($y$, in \$k). The goal is to learn a model that predicts salary from age for new individuals it hasn't seen before.

```{table} Training data - age and salary for 10 individuals. Salary in $k.
:label: tbl-training
:align: center

| Instance | Age ($x$) | Salary $y$ (\$k) |
| :------: | --------: | ---------------: |
|    1     |        25 |              85k |
|    2     |        27 |              90k |
|    3     |        30 |             110k |
|    4     |        35 |             130k |
|    5     |        40 |             180k |
|    6     |        45 |             220k |
|    7     |        65 |             240k |
|    8     |        60 |             250k |
|    9     |        50 |             270k |
|    10    |        55 |             280k |
```

Looking at the data, salary appears to rise with age but levels off - suggesting a curved relationship. To capture this, we fit a **5th-degree polynomial**: a model with five features $x, x^2, x^3, x^4$, and $x^5$. A linear model makes predictions as a weighted sum of its features:

```{math}
:label: linear-model
\hat{y} = b + w_1 x_1 + w_2 x_2 + w_3 x_3 + w_4 x_4 + w_5 x_5
```

Here $a$ is the bias (intercept), $w_1 \ldots w_5$ are the weights, and $x_1 = x,\ x_2 = x^2,\ x_3 = x^3,\ x_4 = x^4,\ x_5 = x^5$.

To fit the model, we minimize the **mean squared error (MSE)** - the average squared gap between true salaries and predicted salaries across all 10 training examples:

```{math}
:label: mse
\text{MSE} = \frac{1}{n} \sum_{i=1}^{n} (y_i - \hat{y}_i)^2
           = \frac{1}{n} \sum_{i=1}^{n} (y_i - b - w_1 x_{1i} - \cdots - w_5 x_{5i})^2
```

We find the values of $a, w_1, w_2, w_3, w_4, w_5$ that make this as small as possible.

:::{note} Why a 5th-degree polynomial?
Using polynomial features ($x^2, x^3, \ldots$) lets a linear model capture curved relationships. A 5th-degree polynomial is deliberately chosen here because it is _more complex than needed_ - it will overfit the data. This makes it a good test case for seeing what regularization can do.
:::

---

## Step 2 - Fitting Without Regularization

_What happens without any penalty on the weights?_

Standard linear regression minimizes the MSE over the training set, as introduced in the example above. After fitting a 5th-degree polynomial, the best-fit model is:

```{math}
:label: no-reg
\hat{y} = 216.5 - 32{,}622.6\,x + 135{,}402.7\,x^2 - 215{,}493.1\,x^3
        + 155{,}314.6\,x^4 - 42{,}558.8\,x^5
```

:::{warning} What's wrong here?
The weights are enormous - in the tens of thousands. This model fits the 10 training points almost perfectly, but it oscillates wildly between them. It has memorized the training data rather than learned a real pattern. On new data it will perform poorly. This is **overfitting**.
:::

---

## Step 3 - Ridge Regression (L2)

_Add a penalty on the squared weights_

Ridge regression modifies the objective function by adding a term that grows with the square of each weight. This discourages the model from assigning large values to any weight.

```{math}
:label: ridge
\frac{1}{n} \sum_{i=1}^{n}(y_i - b - w_1 x_{1i} - \cdots - w_5 x_{5i})^2
\;+\; \lambda \sum_{j=1}^{5} w_j^2
```

The second term penalizes large weights. $\lambda$ controls how strong the penalty is. The bias $a$ is not penalized.

:::{note} Why does squaring the weights work?
Squaring makes the penalty grow very fast as weights get larger. A weight of 100 incurs a penalty 100× bigger than a weight of 10. This strongly encourages the optimizer to find solutions with small, balanced weights - which tend to produce smoother, more generalizable predictions.
:::

The table below shows how the weights change as we increase $\lambda$. Notice how moving from $\lambda = 0$ (no regularization) to even a small $\lambda = 0.02$ dramatically shrinks the weights from the tens of thousands down to double figures.

```{table} Ridge regression - bias and weights for different $\lambda$ values. Salary in $k.
:label: tbl-ridge
:align: center

| $\lambda$ | $b$ (bias) | $w_1\ (x)$ | $w_2\ (x^2)$ | $w_3\ (x^3)$ | $w_4\ (x^4)$ | $w_5\ (x^5)$ |
| --------: | ---------: | ---------: | -----------: | -----------: | -----------: | -----------: |
|  0 (none) |      216.5 |    −32,623 |      135,403 |     −215,493 |      155,315 |      −42,559 |
|      0.02 |      216.5 |       97.8 |         36.6 |         −8.5 |        −35.0 |        −44.6 |
|      0.10 |      216.5 |       56.5 |         28.1 |          3.7 |        −15.1 |        −28.4 |
```

**Observe:** All weights shrink toward zero as $\lambda$ increases, but _none of them ever reach exactly zero_. Ridge keeps all five features in the model, just with smaller coefficients. The bias $a = 216.5$ stays unchanged - it is not regularized.

<iframe src="https://ivannikolov2217.github.io/widgets/widget-ridge(1).html" width="120%" height="500" style="border:1px solid #ccc; display:block;" scrolling="no"></iframe>

:::{tip} Try it: Interactive Regularization Strength
Use the widget above to vary $\lambda$ and watch the Ridge weights shrink smoothly toward zero.
:::

---

## Step 4 - Lasso Regression (L1)

_Add a penalty on the absolute weights_

Lasso (Least Absolute Shrinkage and Selection Operator) uses a similar idea, but penalizes the _absolute value_ of each weight instead of its square.

```{math}
:label: lasso
\frac{1}{n} \sum_{i=1}^{n}(y_i - b - w_1 x_{1i} - \cdots - w_5 x_{5i})^2
\;+\; \lambda \sum_{j=1}^{5} |w_j|
```

The penalty is now the sum of the absolute values of the weights. This has a very different geometric effect to L2.

:::{note} Why does Lasso set weights to exactly zero?
The absolute value function has a sharp "kink" at zero - its gradient is discontinuous there. Geometrically, the L1 penalty ball has corners that align with the axes. The optimal solution is often found exactly at one of these corners, where some weights are _exactly_ zero. L2 (Ridge) has a smooth, round penalty ball - the optimal solution typically lies on its surface away from the axes, so weights get small but not zero.
:::

This property makes Lasso a powerful tool for **automatic feature selection**: it discovers which features are truly useful and eliminates the rest completely.

```{table} Lasso regression - bias and weights for different $\lambda$ values. Salary in $k. Bold zeros = weight eliminated.
:label: tbl-lasso
:align: center

| $\lambda$ | $b$ (bias) | $w_1\ (x)$ | $w_2\ (x^2)$ | $w_3\ (x^3)$ | $w_4\ (x^4)$ | $w_5\ (x^5)$ |
| --------: | ---------: | ---------: | -----------: | -----------: | -----------: | -----------: |
|      0.02 |      216.5 |     −646.4 |      2,046.6 |        **0** |     −3,351.0 |      2,007.9 |
|      0.10 |      216.5 |      355.4 |        **0** |       −494.8 |        **0** |        196.5 |
|      1.00 |      216.5 |      147.4 |        **0** |        **0** |        −99.3 |        **0** |
```

**Note:** The pattern of zeros is perhaps surprising - you might expect Lasso to simply remove the highest-order terms first. In practice, the optimizer finds a different solution. What matters is that _as $\lambda$ grows, fewer and fewer features are kept_, and the model becomes progressively simpler.

<iframe src="https://ivannikolov2217.github.io/widgets/widget-lasso(1).html" width="320" height="140" style="border:1px solid #ccc;"></iframe>

:::{tip} Try it: Interactive Regularization Strength
Use the widget above to vary $\lambda$ and watch Lasso snap individual weights to exactly zero.
:::

---

## Step 5 - Choosing $\lambda$

_The hyperparameter that controls regularization strength_

The parameter $\lambda$ is a **hyperparameter**: it controls how strongly the model is regularized, but it is not learned from the data. You must choose it yourself.

## Interactive λ Explorer

Use the controls below to compare Ridge and Lasso regularization.

<iframe src="https://ivannikolov2217.github.io/widgets/widget-lambda-explorer(1).html" width="320" height="140" style="border:1px solid #ccc;"></iframe>

:::{tip} Try it: Interactive Regularization Strength
Use the widget above to compare how Ridge and Lasso respond to changing $\lambda$ side by side.
:::

::::{grid} 2
:::{card} $\lambda$ too small (near zero)
The penalty is weak. The model behaves almost like standard regression - it can still overfit.
:::
:::{card} $\lambda$ too large
All weights are pushed toward zero. The model predicts close to the bias $a$ for every input - it underfits and is useless.
:::
::::

The standard approach is to try several values and evaluate each one on a **validation set** - data that was not used for training. Choose the $\lambda$ that gives the lowest validation error.

:::{important} The penalty term is only used during training

$$
\text{Training: minimize} \quad \text{MSE} + \lambda \cdot \text{penalty}(\mathbf{w})
$$

Once the model is trained, predictions are made using the standard formula without the penalty term.
:::

**Ridge weights all shrink smoothly as $\lambda$ increases. Lasso weights snap to exactly zero one by one.**

---

## L1 vs L2 - Summary

Both methods add a penalty to the loss function to encourage smaller weights, but they differ in an important way.

```{table} Comparison of Ridge (L2) and Lasso (L1) regularization.
:label: tbl-summary
:align: center

|                       | **Ridge (L2)**                                         | **Lasso (L1)**                                  |
| --------------------- | ------------------------------------------------------ | ----------------------------------------------- |
| **Penalty**           | $\lambda \sum w_j^2$                                   | $\lambda \sum \|w_j\|$                          |
| **Effect on weights** | Shrinks all toward zero, none exactly zero             | Shrinks weights; sets some to _exactly_ zero    |
| **Feature selection** | No - keeps all features                                | Yes - eliminates irrelevant features            |
| **Best for**          | Many features that all contribute; correlated features | Many features, most of which are irrelevant     |
| **Can be solved**     | Analytically (closed form) or gradient descent         | Gradient descent only (not analytically)        |
| **Also known as**     | Tikhonov regression                                    | Least Absolute Shrinkage and Selection Operator |
```
