---
title: 十大经典排序算法总结
category: 计算机基础
tag:
  - 算法
head:
  - - meta
    - name: keywords
      content: 排序算法,快速排序,归并排序,堆排序,冒泡排序,选择排序,插入排序,希尔排序,桶排序,计数排序,基数排序,时间复杂度,空间复杂度,稳定性
  - - meta
    - name: description
      content: 系统梳理十大经典排序算法，附复杂度与稳定性对比，覆盖比较类与非比较类排序的核心原理与实现场景，帮助快速选型与优化。
---

> 本文转自：<http://www.guoyaohua.com/sorting.html>，JavaGuide 对其做了补充完善。

<!-- markdownlint-disable MD024 -->

## 引言

所谓排序，就是使一串记录，按照其中的某个或某些关键字的大小，递增或递减的排列起来的操作。排序算法，就是如何使得记录按照要求排列的方法。排序算法在很多领域得到相当地重视，尤其是在大量数据的处理方面。一个优秀的算法可以节省大量的资源。在各个领域中考虑到数据的各种限制和规范，要得到一个符合实际的优秀算法，得经过大量的推理和分析。

## 简介

### 排序算法总结

常见的内部排序算法有：**插入排序**、**希尔排序**、**选择排序**、**冒泡排序**、**归并排序**、**快速排序**、**堆排序**、**基数排序**等，本文只讲解内部排序算法。用一张表格概括：

| 排序算法 | 时间复杂度（平均） | 时间复杂度（最差） | 时间复杂度（最好） | 空间复杂度 | 排序方式 | 稳定性 |
| -------- | ------------------ | ------------------ | ------------------ | ---------- | -------- | ------ |
| 冒泡排序 | O(n^2)             | O(n^2)             | O(n)               | O(1)       | 内部排序 | 稳定   |
| 选择排序 | O(n^2)             | O(n^2)             | O(n^2)             | O(1)       | 内部排序 | 不稳定 |
| 插入排序 | O(n^2)             | O(n^2)             | O(n)               | O(1)       | 内部排序 | 稳定   |
| 希尔排序 | O(nlogn)           | O(n^2)             | O(nlogn)           | O(1)       | 内部排序 | 不稳定 |
| 归并排序 | O(nlogn)           | O(nlogn)           | O(nlogn)           | O(n)       | 外部排序 | 稳定   |
| 快速排序 | O(nlogn)           | O(n^2)             | O(nlogn)           | O(logn)    | 内部排序 | 不稳定 |
| 堆排序   | O(nlogn)           | O(nlogn)           | O(nlogn)           | O(1)       | 内部排序 | 不稳定 |
| 计数排序 | O(n+k)             | O(n+k)             | O(n+k)             | O(k)       | 外部排序 | 稳定   |
| 桶排序   | O(n+k)             | O(n^2)             | O(n+k)             | O(n+k)     | 外部排序 | 稳定   |
| 基数排序 | O(n×k)             | O(n×k)             | O(n×k)             | O(n+k)     | 外部排序 | 稳定   |

**术语解释**：

- **n**：数据规模，表示待排序的数据量大小。
- **k**：“桶” 的个数，在某些特定的排序算法中（如基数排序、桶排序等），表示分割成的独立的排序区间或类别的数量。
- **内部排序**：所有排序操作都在内存中完成，不需要额外的磁盘或其他存储设备的辅助。这适用于数据量小到足以完全加载到内存中的情况。
- **外部排序**：当数据量过大，不可能全部加载到内存中时使用。外部排序通常涉及到数据的分区处理，部分数据被暂时存储在外部磁盘等存储设备上。
- **稳定**：如果 A 原本在 B 前面，而 $A=B$，排序之后 A 仍然在 B 的前面。
- **不稳定**：如果 A 原本在 B 的前面，而 $A=B$，排序之后 A 可能会出现在 B 的后面。
- **时间复杂度**：定性描述一个算法执行所耗费的时间。
- **空间复杂度**：定性描述一个算法执行所需内存的大小。

### 排序算法分类

十种常见排序算法可以分类两大类别：**比较类排序**和**非比较类排序**。

![排序算法分类](https://oss.javaguide.cn/github/javaguide/cs-basics/sorting-algorithms/sort2.png)

常见的**快速排序**、**归并排序**、**堆排序**以及**冒泡排序**等都属于**比较类排序算法**。比较类排序是通过比较来决定元素间的相对次序，由于其时间复杂度不能突破 `O(nlogn)`，因此也称为非线性时间比较类排序。在冒泡排序之类的排序中，问题规模为 `n`，又因为需要比较 `n` 次，所以平均时间复杂度为 `O(n²)`。在**归并排序**、**快速排序**之类的排序中，问题规模通过**分治法**消减为 `logn` 次，所以时间复杂度平均 `O(nlogn)`。

比较类排序的优势是，适用于各种规模的数据，也不在乎数据的分布，都能进行排序。可以说，比较排序适用于一切需要排序的情况。

而**计数排序**、**基数排序**、**桶排序**则属于**非比较类排序算法**。非比较排序不通过比较来决定元素间的相对次序，而是通过确定每个元素之前，应该有多少个元素来排序。由于它可以突破基于比较排序的时间下界，以线性时间运行，因此称为线性时间非比较类排序。 非比较排序只要确定每个元素之前的已有的元素个数即可，所有一次遍历即可解决。算法时间复杂度 $O(n)$。

非比较排序时间复杂度底，但由于非比较排序需要占用空间来确定唯一位置。所以对数据规模和数据分布有一定的要求。

## 冒泡排序 (Bubble Sort)

冒泡排序是一种简单的排序算法。它重复地遍历要排序的序列，依次比较两个元素，如果它们的顺序错误就把它们交换过来。遍历序列的工作是重复地进行直到没有再需要交换为止，此时说明该序列已经排序完成。这个算法的名字由来是因为越小的元素会经由交换慢慢 “浮” 到数列的顶端。

### 算法步骤

1. 比较相邻的元素。如果第一个比第二个大，就交换它们两个；
2. 对每一对相邻元素作同样的工作，从开始第一对到结尾的最后一对，这样在最后的元素应该会是最大的数；
3. 针对所有的元素重复以上的步骤，除了最后一个；
4. 重复步骤 1~3，直到排序完成。

### 图解算法

![冒泡排序](https://oss.javaguide.cn/github/javaguide/cs-basics/sorting-algorithms/bubble_sort.gif)

### 代码实现

```java
/**
 * 冒泡排序
 * @param arr
 * @return arr
 */
public static int[] bubbleSort(int[] arr) {
    for (int i = 1; i < arr.length; i++) {
        // Set a flag, if true, that means the loop has not been swapped,
        // that is, the sequence has been ordered, the sorting has been completed.
        boolean flag = true;
        for (int j = 0; j < arr.length - i; j++) {
            if (arr[j] > arr[j + 1]) {
                int tmp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = tmp;
       // Change flag
                flag = false;
            }
        }
        if (flag) {
            break;
        }
    }
    return arr;
}
```

**此处对代码做了一个小优化，加入了 `is_sorted` Flag，目的是将算法的最佳时间复杂度优化为 `O(n)`，即当原输入序列就是排序好的情况下，该算法的时间复杂度就是 `O(n)`。**

### 算法分析

- **稳定性**：稳定
- **时间复杂度**：最佳：$O(n)$ ，最差：$O(n^2)$， 平均：$O(n^2)$
- **空间复杂度**：$O(1)$
- **排序方式**：In-place

## 选择排序 (Selection Sort)

选择排序是一种简单直观的排序算法，无论什么数据进去都是 $O(n^2)$ 的时间复杂度。所以用到它的时候，数据规模越小越好。唯一的好处可能就是不占用额外的内存空间了吧。它的工作原理：首先在未排序序列中找到最小（大）元素，存放到排序序列的起始位置，然后，再从剩余未排序元素中继续寻找最小（大）元素，然后放到已排序序列的末尾。以此类推，直到所有元素均排序完毕。

### 算法步骤

1. 首先在未排序序列中找到最小（大）元素，存放到排序序列的起始位置
2. 再从剩余未排序元素中继续寻找最小（大）元素，然后放到已排序序列的末尾。
3. 重复第 2 步，直到所有元素均排序完毕。

### 图解算法

![Selection Sort](https://oss.javaguide.cn/github/javaguide/cs-basics/sorting-algorithms/selection_sort.gif)

### 代码实现

```java
/**
 * 选择排序
 * @param arr
 * @return arr
 */
public static int[] selectionSort(int[] arr) {
    for (int i = 0; i < arr.length - 1; i++) {
        int minIndex = i;
        for (int j = i + 1; j < arr.length; j++) {
            if (arr[j] < arr[minIndex]) {
                minIndex = j;
            }
        }
        if (minIndex != i) {
            int tmp = arr[i];
            arr[i] = arr[minIndex];
            arr[minIndex] = tmp;
        }
    }
    return arr;
}
```

### 算法分析

- **稳定性**：不稳定
- **时间复杂度**：最佳：$O(n^2)$ ，最差：$O(n^2)$， 平均：$O(n^2)$
- **空间复杂度**：$O(1)$
- **排序方式**：In-place

## 插入排序 (Insertion Sort)

插入排序是一种简单直观的排序算法。它的工作原理是通过构建有序序列，对于未排序数据，在已排序序列中从后向前扫描，找到相应位置并插入。插入排序在实现上，通常采用 in-place 排序（即只需用到 $O(1)$ 的额外空间的排序），因而在从后向前扫描过程中，需要反复把已排序元素逐步向后挪位，为最新元素提供插入空间。

插入排序的代码实现虽然没有冒泡排序和选择排序那么简单粗暴，但它的原理应该是最容易理解的了，因为只要打过扑克牌的人都应该能够秒懂。插入排序是一种最简单直观的排序算法，它的工作原理是通过构建有序序列，对于未排序数据，在已排序序列中从后向前扫描，找到相应位置并插入。

插入排序和冒泡排序一样，也有一种优化算法，叫做拆半插入。

### 算法步骤

1. 从第一个元素开始，该元素可以认为已经被排序；
2. 取出下一个元素，在已经排序的元素序列中从后向前扫描；
3. 如果该元素（已排序）大于新元素，将该元素移到下一位置；
4. 重复步骤 3，直到找到已排序的元素小于或者等于新元素的位置；
5. 将新元素插入到该位置后；
6. 重复步骤 2~5。

### 图解算法

![insertion_sort](https://oss.javaguide.cn/github/javaguide/cs-basics/sorting-algorithms/insertion_sort.gif)

### 代码实现

```java
/**
 * 插入排序
 * @param arr
 * @return arr
 */
public static int[] insertionSort(int[] arr) {
    for (int i = 1; i < arr.length; i++) {
        int preIndex = i - 1;
        int current = arr[i];
        while (preIndex >= 0 && current < arr[preIndex]) {
            arr[preIndex + 1] = arr[preIndex];
            preIndex -= 1;
        }
        arr[preIndex + 1] = current;
    }
    return arr;
}
```

### 算法分析

- **稳定性**：稳定
- **时间复杂度**：最佳：$O(n)$ ，最差：$O(n^2)$， 平均：$O(n2)$
- **空间复杂度**：O(1)$
- **排序方式**：In-place

## 希尔排序 (Shell Sort)

希尔排序是希尔 (Donald Shell) 于 1959 年提出的一种排序算法。希尔排序也是一种插入排序，它是简单插入排序经过改进之后的一个更高效的版本，也称为递减增量排序算法，同时该算法是冲破 $O(n^2)$ 的第一批算法之一。

希尔排序的基本思想是：先将整个待排序的记录序列分割成为若干子序列分别进行直接插入排序，待整个序列中的记录 “基本有序” 时，再对全体记录进行依次直接插入排序。

### 算法步骤

我们来看下希尔排序的基本步骤，在此我们选择增量 $gap=length/2$，缩小增量继续以 $gap = gap/2$ 的方式，这种增量选择我们可以用一个序列来表示，$\lbrace \frac{n}{2}, \frac{(n/2)}{2}, \dots, 1 \rbrace$，称为**增量序列**。希尔排序的增量序列的选择与证明是个数学难题，我们选择的这个增量序列是比较常用的，也是希尔建议的增量，称为希尔增量，但其实这个增量序列不是最优的。此处我们做示例使用希尔增量。

先将整个待排序的记录序列分割成为若干子序列分别进行直接插入排序，具体算法描述：

- 选择一个增量序列 $\lbrace t_1, t_2, \dots, t_k \rbrace$，其中 $t_i \gt t_j, i \lt j, t_k = 1$；
- 按增量序列个数 k，对序列进行 k 趟排序；
- 每趟排序，根据对应的增量 $t$，将待排序列分割成若干长度为 $m$ 的子序列，分别对各子表进行直接插入排序。仅增量因子为 1 时，整个序列作为一个表来处理，表长度即为整个序列的长度。

### 图解算法

![shell_sort](https://oss.javaguide.cn/github/javaguide/cs-basics/sorting-algorithms/shell_sort.png)

### 代码实现

```java
/**
 * 希尔排序
 *
 * @param arr
 * @return arr
 */
public static int[] shellSort(int[] arr) {
    int n = arr.length;
    int gap = n / 2;
    while (gap > 0) {
        for (int i = gap; i < n; i++) {
            int current = arr[i];
            int preIndex = i - gap;
            // Insertion sort
            while (preIndex >= 0 && arr[preIndex] > current) {
                arr[preIndex + gap] = arr[preIndex];
                preIndex -= gap;
            }
            arr[preIndex + gap] = current;

        }
        gap /= 2;
    }
    return arr;
}
```

### 算法分析

- **稳定性**：不稳定
- **时间复杂度**：最佳：$O(nlogn)$， 最差：$O(n^2)$ 平均：$O(nlogn)$
- **空间复杂度**：$O(1)$

## 归并排序 (Merge Sort)

归并排序是建立在归并操作上的一种有效的排序算法。该算法是采用分治法 (Divide and Conquer) 的一个非常典型的应用。归并排序是一种稳定的排序方法。将已有序的子序列合并，得到完全有序的序列；即先使每个子序列有序，再使子序列段间有序。若将两个有序表合并成一个有序表，称为 2 - 路归并。

和选择排序一样，归并排序的性能不受输入数据的影响，但表现比选择排序好的多，因为始终都是 $O(nlogn)$ 的时间复杂度。代价是需要额外的内存空间。

### 算法步骤

归并排序算法是一个递归过程，边界条件为当输入序列仅有一个元素时，直接返回，具体过程如下：

1. 如果输入内只有一个元素，则直接返回，否则将长度为 $n$ 的输入序列分成两个长度为 $n/2$ 的子序列；
2. 分别对这两个子序列进行归并排序，使子序列变为有序状态；
3. 设定两个指针，分别指向两个已经排序子序列的起始位置；
4. 比较两个指针所指向的元素，选择相对小的元素放入到合并空间（用于存放排序结果），并移动指针到下一位置；
5. 重复步骤 3 ~ 4 直到某一指针达到序列尾；
6. 将另一序列剩下的所有元素直接复制到合并序列尾。

### 图解算法

![MergeSort](https://oss.javaguide.cn/github/javaguide/cs-basics/sorting-algorithms/merge_sort.gif)

### 代码实现

```java
/**
 * 归并排序
 *
 * @param arr
 * @return arr
 */
public static int[] mergeSort(int[] arr) {
    if (arr.length <= 1) {
        return arr;
    }
    int middle = arr.length / 2;
    int[] arr_1 = Arrays.copyOfRange(arr, 0, middle);
    int[] arr_2 = Arrays.copyOfRange(arr, middle, arr.length);
    return merge(mergeSort(arr_1), mergeSort(arr_2));
}

/**
 * Merge two sorted arrays
 *
 * @param arr_1
 * @param arr_2
 * @return sorted_arr
 */
public static int[] merge(int[] arr_1, int[] arr_2) {
    int[] sorted_arr = new int[arr_1.length + arr_2.length];
    int idx = 0, idx_1 = 0, idx_2 = 0;
    while (idx_1 < arr_1.length && idx_2 < arr_2.length) {
        if (arr_1[idx_1] < arr_2[idx_2]) {
            sorted_arr[idx] = arr_1[idx_1];
            idx_1 += 1;
        } else {
            sorted_arr[idx] = arr_2[idx_2];
            idx_2 += 1;
        }
        idx += 1;
    }
    if (idx_1 < arr_1.length) {
        while (idx_1 < arr_1.length) {
            sorted_arr[idx] = arr_1[idx_1];
            idx_1 += 1;
            idx += 1;
        }
    } else {
        while (idx_2 < arr_2.length) {
            sorted_arr[idx] = arr_2[idx_2];
            idx_2 += 1;
            idx += 1;
        }
    }
    return sorted_arr;
}
```

### 算法分析

- **稳定性**：稳定
- **时间复杂度**：最佳：$O(nlogn)$， 最差：$O(nlogn)$， 平均：$O(nlogn)$
- **空间复杂度**：$O(n)$

## 快速排序 (Quick Sort)

快速排序用到了分治思想，同样的还有归并排序。乍看起来快速排序和归并排序非常相似，都是将问题变小，先排序子串，最后合并。不同的是快速排序在划分子问题的时候经过多一步处理，将划分的两组数据划分为一大一小，这样在最后合并的时候就不必像归并排序那样再进行比较。但也正因为如此，划分的不定性使得快速排序的时间复杂度并不稳定。

快速排序的基本思想：通过一趟排序将待排序列分隔成独立的两部分，其中一部分记录的元素均比另一部分的元素小，则可分别对这两部分子序列继续进行排序，以达到整个序列有序。

### 算法步骤

快速排序使用[分治法](https://zh.wikipedia.org/wiki/分治法)（Divide and conquer）策略来把一个序列分为较小和较大的 2 个子序列，然后递归地排序两个子序列。具体算法描述如下：

1. **选择基准（Pivot）** ：从数组中选一个元素作为基准。为了避免最坏情况，通常会随机选择。
2. **分区（Partition）** ：重新排列序列，将所有比基准值小的元素摆放在基准前面，所有比基准值大的摆在基准的后面（相同的数可以到任一边）。在这个操作结束之后，该基准就处于数列的中间位置。
3. **递归（Recurse）** ：递归地把小于基准值元素的子序列和大于基准值元素的子序列进行快速排序。

**关于性能，这也是它与归并排序的关键区别：**

- **平均和最佳情况：** 它的时间复杂度是 $O(nlogn)$。这种情况发生在每次分区都能把数组分成均等的两半。
- **最坏情况：** 它的时间复杂度会退化到 $O(n^2)$。这发生在每次我们选的基准都是当前数组的最小值或最大值时，比如对一个已经排好序的数组，每次都选第一个元素做基准，这就会导致分区极其不均，算法退化成类似冒泡排序。这就是为什么**随机选择基准**非常重要。

### 图解算法

![RandomQuickSort](https://oss.javaguide.cn/github/javaguide/cs-basics/sorting-algorithms/random_quick_sort.gif)

### 代码实现

```java
import java.util.concurrent.ThreadLocalRandom;

class Solution {
    public int[] sortArray(int[] a) {
        quick(a, 0, a.length - 1);
        return a;
    }

    // 快速排序的核心递归函数
    void quick(int[] a, int left, int right) {
        if (left >= right) { // 递归终止条件：区间只有一个或没有元素
            return;
        }
        int p = partition(a, left, right); // 分区操作，返回分区点索引
        quick(a, left, p - 1); // 对左侧子数组递归排序
        quick(a, p + 1, right); // 对右侧子数组递归排序
    }

    // 分区函数：将数组分为两部分，小于基准值的在左，大于基准值的在右
    int partition(int[] a, int left, int right) {
        // 随机选择一个基准点，避免最坏情况（如数组接近有序）
        int idx = ThreadLocalRandom.current().nextInt(right - left + 1) + left;
        swap(a, left, idx); // 将基准点放在数组的最左端
        int pv = a[left]; // 基准值
        int i = left + 1; // 左指针，指向当前需要检查的元素
        int j = right; // 右指针，从右往左寻找比基准值小的元素

        while (i <= j) {
            // 左指针向右移动，直到找到一个大于等于基准值的元素
            while (i <= j && a[i] < pv) {
                i++;
            }
            // 右指针向左移动，直到找到一个小于等于基准值的元素
            while (i <= j && a[j] > pv) {
                j--;
            }
            // 如果左指针尚未越过右指针，交换两个不符合位置的元素
            if (i <= j) {
                swap(a, i, j);
                i++;
                j--;
            }
        }
        // 将基准值放到分区点位置，使得基准值左侧小于它，右侧大于它
        swap(a, j, left);
        return j;
    }

    // 交换数组中两个元素的位置
    void swap(int[] a, int i, int j) {
        int t = a[i];
        a[i] = a[j];
        a[j] = t;
    }
}
```

### Algorithm analysis

- **STABILITY**: Unstable
- **Time Complexity**: Best: $O(nlogn)$, Worst: $O(n^2)$, Average: $O(nlogn)$
- **Space complexity**: $O(logn)$

## Heap Sort

Heap sort refers to a sorting algorithm designed using the data structure of a heap. A heap is a structure that approximates a complete binary tree and satisfies the properties of a heap: that is, the value of a child node is always less than (or greater than) its parent node.

### Algorithm steps

1. Construct the initial to-be-sorted sequence $(R_1, R_2, \dots, R_n)$ into a large top heap, which is the initial unordered area;
2. Exchange the top element $R_1$ with the last element $R_n$, and get the new unordered area $(R_1, R_2, \dots, R_{n-1})$ and the new ordered area $R_n$, and satisfy $R_i \leqslant R_n (i \in 1, 2,\dots, n-1)$;
3. Since the new heap top $R_1$ after the exchange may violate the properties of the heap, it is necessary to adjust the current unordered area $(R_1, R_2, \dots, R_{n-1})$ to a new heap, and then exchange $R_1$ with the last element of the unordered area again to obtain a new unordered area $(R_1, R_2, \dots, R_{n-2})$ and a new ordered area $(R_{n-1}, R_n)$. Repeat this process until the number of elements in the ordered area is $n-1$, then the entire sorting process is completed.

### Graphical algorithm

![HeapSort](https://oss.javaguide.cn/github/javaguide/cs-basics/sorting-algorithms/heap_sort.gif)

### Code implementation

```java
// Global variable that records the length of an array;
static int heapLen;

/**
 * Swap the two elements of an array
 * @param arr
 * @param i
 * @param j
 */
private static void swap(int[] arr, int i, int j) {
    int tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
}

/**
 * Build Max Heap
 * @param arr
 */
private static void buildMaxHeap(int[] arr) {
    for (int i = arr.length / 2 - 1; i >= 0; i--) {
        heapify(arr, i);
    }
}

/**
 * Adjust it to the maximum heap
 * @param arr
 * @param i
 */
private static void heapify(int[] arr, int i) {
    int left = 2 * i + 1;
    int right = 2 * i + 2;
    int largest = i;
    if (right < heapLen && arr[right] > arr[largest]) {
        largest = right;
    }
    if (left < heapLen && arr[left] > arr[largest]) {
        largest = left;
    }
    if (largest != i) {
        swap(arr, largest, i);
        heapify(arr, largest);
    }
}

/**
 *Heap Sort
 * @param arr
 * @return
 */
public static int[] heapSort(int[] arr) {
    // index at the end of the heap
    heapLen = arr.length;
    // build MaxHeap
    buildMaxHeap(arr);
    for (int i = arr.length - 1; i > 0; i--) {
        // Move the top of the heap to the tail of the heap in turn
        swap(arr, 0, i);
        heapLen -= 1;
        heapify(arr, 0);
    }
    return arr;
}
```

### Algorithm analysis

- **STABILITY**: Unstable
- **Time Complexity**: Best: $O(nlogn)$, Worst: $O(nlogn)$, Average: $O(nlogn)$
- **Space Complexity**: $O(1)$

## Counting Sort

The core of counting sort is to convert the input data values into keys and store them in the additionally opened array space. As a linear time complexity sort, **counting sort requires that the input data must be an integer with a certain range**.

Counting sort is a stable sorting algorithm. Counting sort uses an additional array `C`, where the `i`th element is the number of elements in the array `A` to be sorted whose value is equal to `i`. Then arrange the elements in `A` to the correct position according to the array `C`. **It can only sort integers**.

### Algorithm steps

1. Find the maximum value `max` and the minimum value `min` in the array;
2. Create a new array `C`, whose length is `max-min+1`, and the default values of its elements are 0;
3. Traverse the element `A[i]` in the original array `A`, use `A[i] - min` as the index of the `C` array, and use the number of occurrences of the element in `A` as the value of `C[A[i] - min]`;
4. For the `C` array deformation, the value of the new element is the sum of the value of the element and the previous element, that is, when `i>1`, `C[i] = C[i] + C[i-1]`;
5. Create the result array `R` with the same length as the original array.
6. **Traverse the elements `A[i]` in the original array `A` from back to front, use `A[i]` minus the minimum value `min` as the index, find the corresponding value `C[A[i] - min]`, `C[A[i] - min] - 1` in the count array `C`, which is `A[i]` in the result array `R` After completing the above operations, reduce `count[A[i] - min]` by 1.

### Graphical algorithm

![CountingSort](https://oss.javaguide.cn/github/javaguide/cs-basics/sorting-algorithms/counting_sort.gif)

### Code implementation

```java
/**
 * Gets the maximum and minimum values in the array
 *
 * @param arr
 * @return
 */
private static int[] getMinAndMax(int[] arr) {
    int maxValue = arr[0];
    int minValue = arr[0];
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] > maxValue) {
            maxValue = arr[i];
        } else if (arr[i] < minValue) {
            minValue = arr[i];
        }
    }
    return new int[] { minValue, maxValue };
}

/**
 * Counting Sort
 *
 * @param arr
 * @return
 */
public static int[] countingSort(int[] arr) {
    if (arr. length < 2) {
        return arr;
    }
    int[] extremum = getMinAndMax(arr);
    int minValue = extremum[0];
    int maxValue = extremum[1];
    int[] countArr = new int[maxValue - minValue + 1];
    int[] result = new int[arr.length];

    for (int i = 0; i < arr.length; i++) {
        countArr[arr[i] - minValue] += 1;
    }
    for (int i = 1; i < countArr.length; i++) {
        countArr[i] += countArr[i - 1];
    }
    for (int i = arr.length - 1; i >= 0; i--) {
        int idx = countArr[arr[i] - minValue] - 1;
        result[idx] = arr[i];
        countArr[arr[i] - minValue] -= 1;
    }
    return result;
}```

### Algorithm analysis

When the input elements are `n` integers between `0` and `k`, its running time is $O(n+k)$. Counting sort is not comparison sort, and sorting is faster than any comparison sort algorithm. Since the length of the array `C` used for counting depends on the range of the data in the array to be sorted (equal to the difference between the maximum value and the minimum value of the array to be sorted plus 1**), this makes counting sorting require a lot of additional memory space for arrays with large data ranges.

- **STABILITY**: Stable
- **Time Complexity**: Best: $O(n+k)$ Worst: $O(n+k)$ Average: $O(n+k)$
- **Space Complexity**: $O(k)$

## Bucket Sort

Bucket sort is an upgraded version of counting sort. It makes use of the mapping relationship of functions. The key to efficiency lies in the determination of this mapping function. In order to make bucket sorting more efficient, we need to do these two things:

1. If there is sufficient extra space, increase the number of buckets as much as possible
2. The mapping function used can evenly distribute the input N data into K buckets.

The working principle of bucket sorting: Assume that the input data obeys a uniform distribution, divide the data into a limited number of buckets, and then sort each bucket separately (it is possible to use other sorting algorithms or continue to use bucket sorting in a recursive manner.

### Algorithm steps

1. Set a BucketSize as how many different values can be placed in each bucket;
2. Traverse the input data and map the data to the corresponding buckets in turn;
3. To sort each non-empty bucket, you can use other sorting methods, or you can use bucket sorting recursively;
4. Splice the sorted data from non-empty buckets.

### Graphical algorithm

![BucketSort](https://oss.javaguide.cn/github/javaguide/cs-basics/sorting-algorithms/bucket_sort.gif)

### Code implementation

```java
/**
 * Gets the maximum and minimum values in the array
 * @param arr
 * @return
 */
private static int[] getMinAndMax(List<Integer> arr) {
    int maxValue = arr.get(0);
    int minValue = arr.get(0);
    for (int i : arr) {
        if (i > maxValue) {
            maxValue = i;
        } else if (i < minValue) {
            minValue = i;
        }
    }
    return new int[] { minValue, maxValue };
}

/**
 *Bucket Sort
 * @param arr
 * @return
 */
public static List<Integer> bucketSort(List<Integer> arr, int bucket_size) {
    if (arr.size() < 2 || bucket_size == 0) {
        return arr;
    }
    int[] extremum = getMinAndMax(arr);
    int minValue = extremum[0];
    int maxValue = extremum[1];
    int bucket_cnt = (maxValue - minValue) / bucket_size + 1;
    List<List<Integer>> buckets = new ArrayList<>();
    for (int i = 0; i < bucket_cnt; i++) {
        buckets.add(new ArrayList<Integer>());
    }
    for (int element : arr) {
        int idx = (element - minValue) / bucket_size;
        buckets.get(idx).add(element);
    }
    for (int i = 0; i < buckets.size(); i++) {
        if (buckets.get(i).size() > 1) {
            buckets.set(i, sort(buckets.get(i), bucket_size / 2));
        }
    }
    ArrayList<Integer> result = new ArrayList<>();
    for (List<Integer> bucket : buckets) {
        for (int element : bucket) {
            result.add(element);
        }
    }
    return result;
}
```

### Algorithm analysis

- **STABILITY**: Stable
- **Time Complexity**: Best: $O(n+k)$ Worst: $O(n^2)$ Average: $O(n+k)$
- **Space Complexity**: $O(n+k)$

## Radix Sort

Radix sorting is also a non-comparative sorting algorithm. It sorts each digit in the element, starting from the lowest digit. The complexity is $O(n×k)$, $n$ is the length of the array, and $k$ is the maximum number of digits in the element in the array;

Radix sorting is to sort by low order first, and then collect; then sort by high order, and then collect; and so on, until the highest order. Sometimes some attributes have a priority order, sorted by low priority first, and then by high priority. The final order is that those with higher priority come first, and those with the same high priority and lower priority come first. Radix sorting is based on separate sorting and separate collection, so it is stable.

### Algorithm steps

1. Get the maximum number in the array and the number of digits, which is the number of iterations $N$ (for example: the maximum value in the array is 1000, then $N=4$);
2. `A` is the original array, and each bit is taken from the lowest bit to form the `radix` array;
3. Perform counting sorting on `radix` (using the feature that counting sorting is suitable for small range numbers);
4. Assign `radix` to the original array in turn;
5. Repeat steps 2~4 $N$ times

### Graphical algorithm

![RadixSort](https://oss.javaguide.cn/github/javaguide/cs-basics/sorting-algorithms/radix_sort.gif)

### Code implementation

```java
/**
 * Radix Sort
 *
 * @param arr
 * @return
 */
public static int[] radixSort(int[] arr) {
    if (arr. length < 2) {
        return arr;
    }
    int N = 1;
    int maxValue = arr[0];
    for (int element : arr) {
        if (element > maxValue) {
            maxValue = element;
        }
    }
    while (maxValue / 10 != 0) {
        maxValue = maxValue / 10;
        N += 1;
    }
    for (int i = 0; i < N; i++) {
        List<List<Integer>> radix = new ArrayList<>();
        for (int k = 0; k < 10; k++) {
            radix.add(new ArrayList<Integer>());
        }
        for (int element : arr) {
            int idx = (element / (int) Math.pow(10, i)) % 10;
            radix.get(idx).add(element);
        }
        int idx = 0;
        for (List<Integer> l : radix) {
            for (int n : l) {
                arr[idx++] = n;
            }
        }
    }
    return arr;
}
```

### Algorithm analysis

- **STABILITY**: Stable
- **Time Complexity**: Best: $O(n×k)$ Worst: $O(n×k)$ Average: $O(n×k)$
- **Space Complexity**: $O(n+k)$

**radix sort vs counting sort vs bucket sort**

These three sorting algorithms all use the concept of buckets, but there are obvious differences in how they are used:

- Radix sort: allocate buckets based on each digit of the key value
- Counting sort: Each bucket only stores a single key value
- Bucket sorting: Each bucket stores a certain range of values

## Reference article

- <https://www.cnblogs.com/guoyaohua/p/8600214.html>- <https://en.wikipedia.org/wiki/Sorting_algorithm>
- <https://sort.hust.cc/>

<!-- @include: @article-footer.snippet.md -->