---
title: Summary of classic algorithm ideas (including LeetCode topic recommendations)
category: Computer Basics
tag:
  - Algorithm
head:
  - - meta
    - name: keywords
      content: Greedy, divide and conquer, backtracking, dynamic programming, bisection, double pointers, algorithmic ideas, topic recommendations
  - - meta
    - name: description
      content: Summarizes common algorithm ideas and problem-solving templates, and recommends typical questions, emphasizing thinking paths and complexity trade-offs to quickly build a problem-solving system.
---

## Greedy Algorithm

### Algorithmic Thoughts

The essence of greed is to select the local optimum at each stage to achieve the global optimum.

### General problem solving steps

- Decompose the problem into several sub-problems
- Find a suitable greedy strategy
- Solve the optimal solution for each sub-problem
- Stack local optimal solutions into global optimal solutions

### LeetCode

455. Distribute cookies: <https://leetcode.cn/problems/assign-cookies/>

121. The best time to buy and sell stocks: <https://leetcode.cn/problems/best-time-to-buy-and-sell-stock/>

122. Best time to buy and sell stocks II: <https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-ii/>

55. Jump game: <https://leetcode.cn/problems/jump-game/>

45. Jump Game II: <https://leetcode.cn/problems/jump-game-ii/>

## Dynamic programming

### Algorithmic Thoughts

Each state in dynamic programming must be derived from the previous state. This is different from greed. Greedy has no state derivation, but directly selects the optimal one from the local area.

Classic questions: 01 backpack, complete backpack

### General problem solving steps

- Determine the meaning of dp array (dp table) and subscripts
- Determine the recurrence formula
- How to initialize the dp array
- Determine the order of traversal
- Take an example to derive the dp array

### LeetCode

509. Fibonacci number: <https://leetcode.cn/problems/fibonacci-number/>

746. Use the minimum cost to climb stairs: <https://leetcode.cn/problems/min-cost-climbing-stairs/>

416. Partition equal sum subset: <https://leetcode.cn/problems/partition-equal-subset-sum/>

518. Change exchange: <https://leetcode.cn/problems/coin-change-ii/>

647. Palindromic substrings: <https://leetcode.cn/problems/palindromic-substrings/>

516. The longest palindromic subsequence: <https://leetcode.cn/problems/longest-palindromic-subsequence/>

## Backtracking algorithm

### Algorithmic Thoughts

The backtracking algorithm is actually a search attempt process similar to enumeration. It mainly searches for the solution to the problem during the search attempt process. When it is found that the solution conditions are no longer met,

When the problem occurs, "backtrack" and try other paths. Its essence is exhaustion.

Classic topic: 8 queens

### General problem solving steps

- For a given problem, define the solution space of the problem, which contains at least one (optimal) solution to the problem.
- Determine the structure of the solution space that is easy to search, so that the entire solution space can be easily searched using the backtracking method.
- Search the solution space in a depth-first manner, and use pruning functions to avoid invalid searches during the search process.

### leetcode

77. Combinations: <https://leetcode.cn/problems/combinations/>

39. Combination sum: <https://leetcode.cn/problems/combination-sum/>

40. Combination sum II: <https://leetcode.cn/problems/combination-sum-ii/>

78. Subsets: <https://leetcode.cn/problems/subsets/>

90. Subset II: <https://leetcode.cn/problems/subsets-ii/>

51.N Queen: <https://leetcode.cn/problems/n-queens/>

## Divide and conquer algorithm

### Algorithmic Thoughts

Decompose a problem of size N into K sub-problems of smaller size, which are independent of each other and have the same properties as the original problem. By finding the solution to the subproblem, you can get the solution to the original problem.

Classic questions: Binary search, Tower of Hanoi problem

### General problem solving steps

- Decompose the original problem into several smaller, independent sub-problems with the same form as the original problem;
- If the sub-problem is small and easy to solve, solve it directly, otherwise solve each sub-problem recursively
- Combine the solutions of each subproblem into the solution of the original problem.

### LeetCode

108. Convert an ordered array into a binary search tree: <https://leetcode.cn/problems/convert-sorted-array-to-binary-search-tree/>

148. Sort list: <https://leetcode.cn/problems/sort-list/>

23. Merge k ascending linked lists: <https://leetcode.cn/problems/merge-k-sorted-lists/>