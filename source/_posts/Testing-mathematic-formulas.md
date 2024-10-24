---
title: Testing mathematic formulas
date: 2024-10-21 17:09:20
tags: test
katex: true
---
# 这是一个数学公式测试页面

在这个页面中，我们将测试一些常见的数学公式，确保它们在你的 Hexo 博客中能够正确渲染。

## 行内公式

行内公式可以通过两对美元符号 `$...$` 来包裹。比如，这里有一个简单的行内公式：

$E = mc^2$

## 块级公式

块级公式使用两对双美元符号 `$$...$$` 来包裹，通常用来表示较大的公式。例如，下面是一个关于二次方程的解法：

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

我们也可以测试一些矩阵的表达式：

$$
\mathbf{A} = \begin{pmatrix}
a_{11} & a_{12} & \cdots & a_{1n} \\
a_{21} & a_{22} & \cdots & a_{2n} \\
\vdots & \vdots & \ddots & \vdots \\
a_{m1} & a_{m2} & \cdots & a_{mn}
\end{pmatrix}
$$

## 三角函数

测试一下三角函数的渲染效果：

$$
\sin(\theta) = \frac{\text{opposite}}{\text{hypotenuse}}
$$

$$
\cos(\theta) = \frac{\text{adjacent}}{\text{hypotenuse}}
$$

## 总结

如果你看到这些公式已经被正确渲染，那么说明 KaTeX 已经在你的博客中正常工作了！