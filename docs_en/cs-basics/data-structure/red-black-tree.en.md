---
title: red-black tree
category: Computer Basics
tag:
  - data structure
head:
  - - meta
    - name: keywords
      content: red-black tree, self-balancing, rotation, insertion and deletion, properties, black height, time complexity
  - - meta
    - name: description
      content: In-depth explanation of the five properties of red-black trees and the rotation adjustment process, understanding of the self-balancing mechanism and its application in standard libraries and index structures.
---

## Introduction to red-black trees

Red Black Tree is a self-balancing binary search tree. It was invented by Rudolf Bayer in 1972 and was known as symmetric binary B-trees. It was later modified in 1978 by Leo J. Guibas and Robert Sedgewick to its current "red-black tree".

Due to its self-balancing characteristics, it ensures that operations such as search, addition, and deletion can be completed within O(logn) time complexity in the worst case, with stable performance.

In the JDK, `TreeMap`, `TreeSet` and JDK1.8's `HashMap` all use red-black trees at the bottom layer.

## Why do we need red-black trees?

The red-black tree was born to solve the shortcomings of the binary search tree.

Binary search tree is a data structure based on comparison. Each node of it has a key value, and the key value of the left child node is less than the key value of the parent node, and the key value of the right child node is greater than the key value of the parent node. Such a structure can facilitate search, insertion, and deletion operations, because only the key values ​​of the nodes need to be compared to determine the location of the target node. However, a big problem with a binary search tree is that its shape depends on the order in which nodes are inserted. If nodes are inserted in ascending or descending order, the binary search tree will degenerate into a linear structure, that is, a linked list. In this case, the performance of the binary search tree will be greatly reduced, and the time complexity will change from O(logn) to O(n).

The red-black tree was born to solve the shortcomings of the binary search tree, because the binary search tree will degenerate into a linear structure in some cases.

## **Features of red-black trees**

1. Each node is either red or black. Black determines balance, red does not. This corresponds to 1~2 nodes that can be stored in one node in the 2-3 tree.
2. The root node is always black.
3. Each leaf node is a black empty node (NIL node). What this means is that the red-black tree will have an empty leaf node, which is the rule of the red-black tree.
4. If a node is red, its child nodes must be black (not necessarily vice versa). Usually this rule is also called no consecutive red nodes. A node can temporarily have up to 3 child nodes, with a black node in the middle and red nodes on the left and right.
5. Each path from any node to its leaf node or empty child node must contain the same number of black nodes (that is, the same black height). Each layer has only one node that contributes to the tree height to determine the balance, which corresponds to the black node in the red-black tree.

It is these characteristics that ensure the balance of the red-black tree, so that the height of the red-black tree will not exceed 2log(n+1).

## Red-black tree data structure

Based on the BST binary search tree, AVL, 2-3 trees, and red-black trees are all self-balancing binary trees (collectively referred to as B-trees). However, compared to the time complexity caused by high-level balancing in AVL trees, red-black trees have looser control over balance. Red-black trees only need to ensure the balance of black nodes.

## Red-black tree structure implementation

```java
public class Node {

    public Class<?> clazz;
    public Integer value;
    public Node parent;
    public Node left;
    public Node right;

    // Required properties for AVL tree
    public int height;
    // Attributes required for red-black tree
    public Color color = Color.RED;

}
```

### 1. Left leaning dyeing

![Slide 1](./pictures/red-black tree/red-black tree 1.png)

- When dyeing, find the uncle node of the current node based on the grandfather node of the current node.
- Then dye the parent node black, the uncle node black, and the grandpa node red. However, the grandfather node's red coloring is temporary, and the root node will be dyed black after the balancing tree height operation.

### 2. Right leaning dyeing

![Slide 2](./pictures/red-black tree/red-black tree 2.png)

### 3. Left-hand balance adjustment

#### 3.1 One left rotation

![Slide 3](./pictures/red-black tree/red-black tree 3.png)

#### 3.2 Right-hand rotation + Left-hand rotation

![Slide 4](./pictures/red-black tree/red-black tree 4.png)

### 4. Right-hand adjustment

#### 4.1 One right turn

![Slide 5](./pictures/red-black tree/red-black tree 5.png)

#### 4.2 Left-hand + right-hand rotation

![Slide 6](./pictures/red-black tree/red-black tree 6.png)

## Article recommendation

- ["In-depth analysis of red-black trees and Java implementation" - Meituan Dianping technical team](https://zhuanlan.zhihu.com/p/24367771)
- [Comics: What is a red-black tree? - Programmer Xiao Hui](https://juejin.im/post/5a27c6946fb9a04509096248#comment) (Also introduced the binary search tree, highly recommended)

<!-- @include: @article-footer.snippet.md -->