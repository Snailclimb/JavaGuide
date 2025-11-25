---
title: Redis为什么用跳表实现有序集合
category: 数据库
tag:
  - Redis
head:
  - - meta
    - name: keywords
      content: Redis,跳表,有序集合,ZSet,时间复杂度,平衡树对比,实现原理
  - - meta
    - name: description
      content: 深入讲解 Redis 有序集合为何选择跳表实现，结合时间复杂度与平衡树对比，理解工程权衡与源码细节。
---

## 前言

近几年针对 Redis 面试时会涉及常见数据结构的底层设计，其中就有这么一道比较有意思的面试题：“Redis 的有序集合底层为什么要用跳表，而不用平衡树、红黑树或者 B+树？”。

本文就以这道大厂常问的面试题为切入点，带大家详细了解一下跳表这个数据结构。

本文整体脉络如下图所示，笔者会从有序集合的基本使用到跳表的源码分析和实现，让你会对 Redis 的有序集合底层实现的跳表有着更深刻的理解和掌握。

![](https://oss.javaguide.cn/javaguide/database/redis/skiplist/202401222005468.png)

## 跳表在 Redis 中的运用

这里我们需要先了解一下 Redis 用到跳表的数据结构有序集合的使用，Redis 有个比较常用的数据结构叫**有序集合(sorted set，简称 zset)**，正如其名它是一个可以保证有序且元素唯一的集合，所以它经常用于排行榜等需要进行统计排列的场景。

这里我们通过命令行的形式演示一下排行榜的实现，可以看到笔者分别输入 3 名用户：**xiaoming**、**xiaohong**、**xiaowang**，它们的**score**分别是 60、80、60，最终按照成绩升级降序排列。

```bash

127.0.0.1:6379> zadd rankList 60 xiaoming
(integer) 1
127.0.0.1:6379> zadd rankList 80 xiaohong
(integer) 1
127.0.0.1:6379> zadd rankList 60 xiaowang
(integer) 1

# 返回有序集中指定区间内的成员，通过索引，分数从高到低
127.0.0.1:6379> ZREVRANGE rankList 0 100 WITHSCORES
1) "xiaohong"
2) "80"
3) "xiaowang"
4) "60"
5) "xiaoming"
6) "60"
```

此时我们通过 `object` 指令查看 zset 的数据结构，可以看到当前有序集合存储的还是**ziplist(压缩列表)**。

```bash
127.0.0.1:6379> object encoding rankList
"ziplist"
```

因为设计者考虑到 Redis 数据存放于内存，为了节约宝贵的内存空间，在有序集合元素小于 64 字节且个数小于 128 的时候，会使用 ziplist，而这个阈值的默认值的设置就来自下面这两个配置项。

```bash
zset-max-ziplist-value 64
zset-max-ziplist-entries 128
```

一旦有序集合中的某个元素超出这两个其中的一个阈值它就会转为 **skiplist**（实际是 dict+skiplist，还会借用字典来提高获取指定元素的效率）。

我们不妨在添加一个大于 64 字节的元素，可以看到有序集合的底层存储转为 skiplist。

```bash
127.0.0.1:6379> zadd rankList 90 yigemingzihuichaoguo64zijiedeyonghumingchengyongyuceshitiaobiaodeshijiyunyong
(integer) 1

# 超过阈值，转为跳表
127.0.0.1:6379> object encoding rankList
"skiplist"
```

也就是说，ZSet 有两种不同的实现，分别是 ziplist 和 skiplist，具体使用哪种结构进行存储的规则如下：

- 当有序集合对象同时满足以下两个条件时，使用 ziplist：
  1. ZSet 保存的键值对数量少于 128 个；
  2. 每个元素的长度小于 64 字节。
- 如果不满足上述两个条件，那么使用 skiplist 。

## 手写一个跳表

为了更好的回答上述问题以及更好的理解和掌握跳表，这里可以通过手写一个简单的跳表的形式来帮助读者理解跳表这个数据结构。

我们都知道有序链表在添加、查询、删除的平均时间复杂都都是 **O(n)** 即线性增长，所以一旦节点数量达到一定体量后其性能表现就会非常差劲。而跳表我们完全可以理解为在原始链表基础上，建立多级索引，通过多级索引检索定位将增删改查的时间复杂度变为 **O(log n)** 。

可能这里说的有些抽象，我们举个例子，以下图跳表为例，其原始链表存储按序存储 1-10，有 2 级索引，每级索引的索引个数都是基于下层元素个数的一半。

![](https://oss.javaguide.cn/javaguide/database/redis/skiplist/202401222005436.png)

假如我们需要查询元素 6，其工作流程如下：

1. 从 2 级索引开始，先来到节点 4。
2. 查看 4 的后继节点，是 8 的 2 级索引，这个值大于 6，说明 2 级索引后续的索引都是大于 6 的，没有再往后搜寻的必要，我们索引向下查找。
3. 来到 4 的 1 级索引，比对其后继节点为 6，查找结束。

相较于原始有序链表需要 6 次，我们的跳表通过建立多级索引，我们只需两次就直接定位到了目标元素，其查寻的复杂度被直接优化为**O(log n)**。

![](https://oss.javaguide.cn/javaguide/database/redis/skiplist/202401222005524.png)

对应的添加也是一个道理，假如我们需要在这个有序集合中添加一个元素 7，那么我们就需要通过跳表找到**小于元素 7 的最大值**，也就是下图元素 6 的位置，将其插入到元素 6 的后面，让元素 6 的索引指向新插入的节点 7，其工作流程如下：

1. 从 2 级索引开始定位到了元素 4 的索引。
2. 查看索引 4 的后继索引为 8，索引向下推进。
3. 来到 1 级索引，发现索引 4 后继索引为 6，小于插入元素 7，指针推进到索引 6 位置。
4. 继续比较 6 的后继节点为索引 8，大于元素 7，索引继续向下。
5. 最终我们来到 6 的原始节点，发现其后继节点为 7，指针没有继续向下的空间，自此我们可知元素 6 就是小于插入元素 7 的最大值，于是便将元素 7 插入。

![](https://oss.javaguide.cn/javaguide/database/redis/skiplist/202401222005480.png)

这里我们又面临一个问题，我们是否需要为元素 7 建立索引，索引多高合适？

我们上文提到，理想情况是每一层索引是下一层元素个数的二分之一，假设我们的总共有 16 个元素，对应各级索引元素个数应该是：

```bash
1. 一级索引:16/2=8
2. 二级索引:8/2 =4
3. 三级索引:4/2=2
```

由此我们用数学归纳法可知：

```bash
1. 一级索引:16/2=16/2^1=8
2. 二级索引:8/2 => 16/2^2 =4
3. 三级索引:4/2=>16/2^3=2
```

假设元素个数为 n，那么对应 k 层索引的元素个数 r 计算公式为:

```bash
r=n/2^k
```

同理我们再来推断以下索引的最大高度，一般来说最高级索引的元素个数为 2，我们设元素总个数为 n，索引高度为 h，代入上述公式可得：

```bash
2= n/2^h
=> 2*2^h=n
=> 2^(h+1)=n
=> h+1=log2^n
=> h=log2^n -1
```

而 Redis 又是内存数据库，我们假设元素最大个数是**65536**，我们把**65536**代入上述公式可知最大高度为 16。所以我们建议添加一个元素后为其建立的索引高度不超过 16。

因为我们要求尽可能保证每一个上级索引都是下级索引的一半，在实现高度生成算法时，我们可以这样设计：

1. 跳表的高度计算从原始链表开始，即默认情况下插入的元素的高度为 1，代表没有索引，只有元素节点。
2. 设计一个为插入元素生成节点索引高度 level 的方法。
3. 进行一次随机运算，随机数值范围为 0-1 之间。
4. 如果随机数大于 0.5 则为当前元素添加一级索引，自此我们保证生成一级索引的概率为 **50%** ，这也就保证了 1 级索引理想情况下只有一半的元素会生成索引。
5. 同理后续每次随机算法得到的值大于 0.5 时，我们的索引高度就加 1，这样就可以保证节点生成的 2 级索引概率为 **25%** ，3 级索引为 **12.5%** ……

我们回过头，上述插入 7 之后，我们通过随机算法得到 2，即要为其建立 1 级索引：

![](https://oss.javaguide.cn/javaguide/database/redis/skiplist/202401222005505.png)

Finally, let’s talk about deletion. Suppose we want to delete element 10 here. We must locate the maximum value of the current jump table **each layer** element that is less than 10. The index execution steps are:

1. The successor node of level 2 index 4 is 8, and the pointer advances.
2. Index 8 has no successor node, there is no element to be deleted in this layer, and the pointer points directly downward.
3. The successor node of level 1 index 8 is 10, which means that when deleting level 1 index 8, it needs to disconnect its pointer from level 1 index 10 and delete 10.
4. After the level 1 index is positioned, the pointer moves downward, the subsequent node is 9, and the pointer advances.
5. The successor node of 9 is 10. Similarly, it needs to point to null and delete 10.

![](https://oss.javaguide.cn/javaguide/database/redis/skiplist/202401222005503.png)

### Template definition

After having the overall idea, we can start to implement a skip list. First, define the node **Node** in the skip list. From the above demonstration, we can see that each **Node** contains the following elements:

1. The stored **value** value.
2. The address of the successor node.
3. Multi-level index.

In order to more conveniently and uniformly manage the **Node** successor node addresses and the element addresses pointed to by the multi-level index, the author set up a **forwards** array in **Node** to record the successor nodes of the original linked list node and the successor node points of the multi-level index.

Take the following figure as an example. The length of our **forwards** array is 5, in which **index 0** records the successor node address of the original linked list node, while the rest from bottom to top represent the successor node points from the 1st level index to the 4th level index.

![](https://oss.javaguide.cn/javaguide/database/redis/skiplist/202401222005347.png)

So we have such a code definition. It can be seen that the author sets the length of the array to a fixed 16** (the maximum height calculated above is recommended to be 16)**. The default **data** is -1, and the maximum height of the node **maxLevel** is initialized to 1. Note that the value of **maxLevel** represents the total height of the original linked list plus the index.

```java
/**
 * The maximum height of the skip table index is 16
 */
private static final int MAX_LEVEL = 16;

class Node {
    private int data = -1;
    private Node[] forwards = new Node[MAX_LEVEL];
    private int maxLevel = 0;

}
```

### Element addition

After defining the node, we first add the following elements. When adding elements, the first step is to set **data**. We can directly set the incoming **value** to **data**.

Then there is the setting of the height **maxLevel**. We have also given the idea above. The default height is 1, that is, there is only one original linked list node. Through the random algorithm, the index height is increased by 1 every time it is greater than 0.5. From this, we derive the height calculation algorithm `randomLevel()`:

```java
/**
 * Theoretically, the number of elements in the primary index should account for 50% of the original data, the number of elements in the secondary index should account for 25%, and the third-level index should account for 12.5%, all the way to the top.
 * Because the promotion probability of each level here is 50%. For each newly inserted node, randomLevel needs to be called to generate a reasonable number of levels.
 * The randomLevel method will randomly generate a number between 1~MAX_LEVEL, and:
 * 50% probability of returning 1
 * 25% probability of returning 2
 * 12.5% probability of returning 3...
 * @return
 */
private int randomLevel() {
    int level = 1;
    while (Math.random() > PROB && level < MAX_LEVEL) {
        ++level;
    }
    return level;
}
```

Then set the successor node address of the **Node** and **Node** index currently to be inserted. This step is a little more complicated. We assume that the height of the current node is 4, that is, 1 node plus 3 indexes, so we create an array **maxOfMinArr** with a length of 4, and traverse the maximum value of the index nodes at all levels that is smaller than the current **value**.

Assume that the **value** we want to insert is 5. Our array search result shows that the predecessor node of the current node and the predecessor nodes of the first-level index and the second-level index are all 4, and the third-level index is empty.

![](https://oss.javaguide.cn/javaguide/database/redis/skiplist/202401222005299.png)

Then we locate the successor nodes at all levels based on this array **maxOfMinArr**, so that the inserted element 5 points to these successor nodes, and **maxOfMinArr** points to 5. The result is as follows:

![](https://oss.javaguide.cn/javaguide/database/redis/skiplist/202401222005369.png)

The conversion into code is in the following form. Isn't it very simple? Let's continue:

```java
/**
 * The default height is 1, that is, there is only one node of its own.
 */
private int levelCount = 1;

/**
 * The node at the bottom of the jump list, that is, the head node
 */
private Node h = new Node();

public void add(int value) {
    int level = randomLevel(); // Random height of new node

    Node newNode = new Node();
    newNode.data = value;
    newNode.maxLevel = level;

    //An array used to record the predecessor nodes of each layer
    Node[] update = new Node[level];
    for (int i = 0; i < level; i++) {
        update[i] = h;
    }

    Node p = h;
    // Key correction: Start searching from the current highest level of the jump list
    for (int i = levelCount - 1; i >= 0; i--) {
        while (p.forwards[i] != null && p.forwards[i].data < value) {
            p = p.forwards[i];
        }
        //Only record the predecessor nodes of the layer that needs to be updated
        if (i < level) {
            update[i] = p;
        }
    }

    //Insert new node
    for (int i = 0; i < level; i++) {
        newNode.forwards[i] = update[i].forwards[i];
        update[i].forwards[i] = newNode;
    }

    //Update the total height of the jump table
    if (levelCount < level) {
        levelCount = level;
    }
}
```

### Element query

The query logic is relatively simple. Start from the highest-level index of the jump table and locate the maximum value that is less than the value to be queried. Take the following figure as an example. We hope to find node 8:

![](https://oss.javaguide.cn/javaguide/database/redis/skiplist/202401222005323.png)

- **Start from the highest level (level 3 index)**: The search pointer `p` starts from the head node. On a level 3 index, `p`'s successor `forwards[2]` (assuming level 3 up, indexing starts at 0) points to node `5`. Since `5 < 8`, pointer `p` moves right to node `5`. The successor `forwards[2]` of node `5` at the level 3 index is `null` (or points to a node greater than `8`, not shown in the figure). The search to the right of the current level ends, pointer `p` remains at node `5`, and moves down to the level 2 index**.
- **Indexed at Level 2**: Current pointer `p` is node `5`. The successor `forwards[1]` of `p` points to node `8`. Since `8` is not less than `8` (i.e. `8 < 8` is `false`), the current level search to the right ends (`p` will not move to node `8`). Pointer `p` remains at node `5` and moves down to index level 1**.- **在 1 级索引** ：当前指针 `p` 为节点 `5`。`p` 的后继 `forwards[0]` 指向最底层的节点 `5`。由于 `5 < 8`，指针 `p` 向右移动到最底层的节点 `5`。此时，当前指针 `p` 为最底层的节点 `5`。其后继 `forwards[0]` 指向最底层的节点 `6`。由于 `6 < 8`，指针 `p` 向右移动到最底层的节点 `6`。当前指针 `p` 为最底层的节点 `6`。其后继 `forwards[0]` 指向最底层的节点 `7`。由于 `7 < 8`，指针 `p` 向右移动到最底层的节点 `7`。当前指针 `p` 为最底层的节点 `7`。其后继 `forwards[0]` 指向最底层的节点 `8`。由于 `8` 不小于 `8`（即 `8 < 8` 为 `false`），当前层级向右查找结束。此时，已经遍历完所有层级，`for` 循环结束。
- **最终定位与检查** ：经过所有层级的查找，指针 `p` 最终停留在最底层（0 级索引）的节点 `7`。这个节点是整个跳表中值小于目标值 `8` 的那个最大的节点。检查节点 `7` 的**后继节点**（即 `p.forwards[0]`）：`p.forwards[0]` 指向节点 `8`。判断 `p.forwards[0].data`（即节点 `8` 的值）是否等于目标值 `8`。条件满足（`8 == 8`），**查找成功，找到节点 `8`**。

所以我们的代码实现也很上述步骤差不多，从最高级索引开始向前查找，如果不为空且小于要查找的值，则继续向前搜寻，遇到不小于的节点则继续向下，如此往复，直到得到当前跳表中小于查找值的最大节点，查看其前驱是否等于要查找的值：

```java
public Node get(int value) {
    Node p = h; // 从头节点开始

    // 从最高层级索引开始，逐层向下
    for (int i = levelCount - 1; i >= 0; i--) {
        // 在当前层级向右查找，直到 p.forwards[i] 为 null
        // 或者 p.forwards[i].data 大于等于目标值 value
        while (p.forwards[i] != null && p.forwards[i].data < value) {
            p = p.forwards[i]; // 向右移动
        }
        // 此时 p.forwards[i] 为 null，或者 p.forwards[i].data >= value
        // 或者 p 是当前层级中小于 value 的最大节点（如果存在这样的节点）
    }

    // 经过所有层级的查找，p 现在是原始链表（0级索引）中
    // 小于目标值 value 的最大节点（或者头节点，如果所有元素都大于等于 value）

    // 检查 p 在原始链表中的下一个节点是否是目标值
    if (p.forwards[0] != null && p.forwards[0].data == value) {
        return p.forwards[0]; // 找到了，返回该节点
    }

    return null; // 未找到
}
```

### 元素删除

最后是删除逻辑，需要查找各层级小于要删除节点的最大值，假设我们要删除 10：

1. 3 级索引得到小于 10 的最大值为 5，继续向下。
2. 2 级索引从索引 5 开始查找，发现小于 10 的最大值为 8，继续向下。
3. 同理 1 级索引得到 8，继续向下。
4. 原始节点找到 9。
5. 从最高级索引开始，查看每个小于 10 的节点后继节点是否为 10，如果等于 10，则让这个节点指向 10 的后继节点，将节点 10 及其索引交由 GC 回收。

![](https://oss.javaguide.cn/javaguide/database/redis/skiplist/202401222005350.png)

```java
/**
 * 删除
 *
 * @param value
 */
public void delete(int value) {
    Node p = h;
    //找到各级节点小于value的最大值
    Node[] updateArr = new Node[levelCount];
    for (int i = levelCount - 1; i >= 0; i--) {
        while (p.forwards[i] != null && p.forwards[i].data < value) {
            p = p.forwards[i];
        }
        updateArr[i] = p;
    }
    //查看原始层节点前驱是否等于value，若等于则说明存在要删除的值
    if (p.forwards[0] != null && p.forwards[0].data == value) {
        //从最高级索引开始查看其前驱是否等于value，若等于则将当前节点指向value节点的后继节点
        for (int i = levelCount - 1; i >= 0; i--) {
            if (updateArr[i].forwards[i] != null && updateArr[i].forwards[i].data == value) {
                updateArr[i].forwards[i] = updateArr[i].forwards[i].forwards[i];
            }
        }
    }

    //从最高级开始查看是否有一级索引为空，若为空则层级减1
    while (levelCount > 1 && h.forwards[levelCount - 1] == null) {
        levelCount--;
    }

}
```

### 完整代码以及测试

完整代码如下，读者可自行参阅:

```java
public class SkipList {

    /**
     * 跳表索引最大高度为16
     */
    private static final int MAX_LEVEL = 16;

    /**
     * 每个节点添加一层索引高度的概率为二分之一
     */
    private static final float PROB = 0.5f;

    /**
     * 默认情况下的高度为1，即只有自己一个节点
     */
    private int levelCount = 1;

    /**
     * 跳表最底层的节点，即头节点
     */
    private Node h = new Node();

    public SkipList() {
    }

    public class Node {

        private int data = -1;
        /**
         *
         */
        private Node[] forwards = new Node[MAX_LEVEL];
        private int maxLevel = 0;

        @Override
        public String toString() {
            return "Node{"
                    + "data=" + data
                    + ", maxLevel=" + maxLevel
                    + '}';
        }
    }

    public void add(int value) {
        int level = randomLevel(); // 新节点的随机高度

        Node newNode = new Node();
        newNode.data = value;
        newNode.maxLevel = level;

        // 用于记录每层前驱节点的数组
        Node[] update = new Node[level];
        for (int i = 0; i < level; i++) {
            update[i] = h;
        }

        Node p = h;
        // 关键修正：从跳表的当前最高层开始查找
        for (int i = levelCount - 1; i >= 0; i--) {
            while (p.forwards[i] != null && p.forwards[i].data < value) {
                p = p.forwards[i];
            }
            // 只记录需要更新的层的前驱节点
            if (i < level) {
                update[i] = p;
            }
        }

        // 插入新节点
        for (int i = 0; i < level; i++) {
            newNode.forwards[i] = update[i].forwards[i];
            update[i].forwards[i] = newNode;
        }

        // 更新跳表的总高度
        if (levelCount < level) {
            levelCount = level;
        }
    }

    /**
     * 理论来讲，一级索引中元素个数应该占原始数据的 50%，二级索引中元素个数占 25%，三级索引12.5% ，一直到最顶层。
     * 因为这里每一层的晋升概率是 50%。对于每一个新插入的节点，都需要调用 randomLevel 生成一个合理的层数。 该 randomLevel
     * 方法会随机生成 1~MAX_LEVEL 之间的数，且 ： 50%的概率返回 1 25%的概率返回 2 12.5%的概率返回 3 ...
     *
     * @return
     */
    private int randomLevel() {
        int level = 1;
        while (Math.random() > PROB && level < MAX_LEVEL) {
            ++level;
        }
        return level;
    }

    public Node get(int value) {
        Node p = h;
        //找到小于value的最大值
        for (int i = levelCount - 1; i >= 0; i--) {
            while (p.forwards[i] != null && p.forwards[i].data < value) {
                p = p.forwards[i];
            }
        }
        //如果p的前驱节点等于value则直接返回
        if (p.forwards[0] != null && p.forwards[0].data == value) {
            return p.forwards[0];
        }

        return null;
    }

    /**
     * 删除
     *
     * @param value
     */
    public void delete(int value) {
        Node p = h;
        //找到各级节点小于value的最大值
        Node[] updateArr = new Node[levelCount];
        for (int i = levelCount - 1; i >= 0; i--) {
            while (p.forwards[i] != null && p.forwards[i].data < value) {
                p = p.forwards[i];
            }
            updateArr[i] = p;
        }
        //查看原始层节点前驱是否等于value，若等于则说明存在要删除的值
        if (p.forwards[0] != null && p.forwards[0].data == value) {
            //从最高级索引开始查看其前驱是否等于value，若等于则将当前节点指向value节点的后继节点
            for (int i = levelCount - 1; i >= 0; i--) {
                if (updateArr[i].forwards[i] != null && updateArr[i].forwards[i].data == value) {
                    updateArr[i].forwards[i] = updateArr[i].forwards[i].forwards[i];
                }
            }
        }

        //从最高级开始查看是否有一级索引为空，若为空则层级减1
        while (levelCount > 1 && h.forwards[levelCount - 1] == null) {
            levelCount--;
        }

    }

    public void printAll() {
        Node p = h;
        //基于最底层的非索引层进行遍历，只要后继节点不为空，则速速出当前节点，并移动到后继节点
        while (p.forwards[0] != null) {
            System.out.println(p.forwards[0]);
            p = p.forwards[0];
        }

    }
}

```

Test code:

```java
public static void main(String[] args) {
        SkipList skipList = new SkipList();
        for (int i = 0; i < 24; i++) {
            skipList.add(i);
        }

        System.out.println("************Output added results**********");
        skipList.printAll();

        SkipList.Node node = skipList.get(22);
        System.out.println("************query results:" + node+" ************");

        skipList.delete(22);
        System.out.println("************Delete result**********");
        skipList.printAll();


    }
```

**Features of Redis skip table**:

1. Using **doubly linked list**, different from the above example, there is a rollback pointer. It is mainly used to simplify operations. For example, when deleting an element, you also need to find the predecessor node of the element. It is very convenient to use the rollback pointer.
2. The `score` value can be repeated. If the `score` value is the same, it will be sorted according to the ele (the value stored in the node, which is sds) dictionary.
3. The default maximum number of levels allowed by the Redis jump table is 32, which is defined by `ZSKIPLIST_MAXLEVEL` in the source code.

## Comparison with other three data structures

Finally, let’s answer the interview question at the beginning of the article: “Why does the bottom layer of Redis’s ordered set use a jump table instead of a balanced tree, a red-black tree, or a B+ tree?”

### Balanced tree vs skip list

Let’s first talk about its comparison with the balanced tree. The balanced tree is also called the AVL tree. It is a strictly balanced binary tree. The balance condition must be met (the height difference between the left and right subtrees of all nodes does not exceed 1, that is, the balance factor is in the range `[-1,1]`). The time complexity of insertion, deletion and query of the balanced tree is the same as that of the skip table **O(log n)**.

For range queries, it can also achieve the same effect as skipping tables through in-order traversal. However, every insertion or deletion operation needs to ensure the absolute balance of the left and right nodes of the entire tree. As long as it is unbalanced, it must be maintained through rotation operations. This process is relatively time-consuming.

![](https://oss.javaguide.cn/javaguide/database/redis/skiplist/202401222005312.png)

The original intention of the birth of skip lists is to overcome some shortcomings of balanced trees. The inventor of skip lists mentioned in detail in the paper ["Skip lists: a probabilistic alternative to balanced trees"](https://15721.courses.cs.cmu.edu/spring2018/papers/08-oltpindexes1/pugh-skiplists-cacm1990.pdf):

![](https://oss.javaguide.cn/github/javaguide/database/redis/skiplist-a-probabilistic-alternative-to-balanced-trees.png)

> Skip lists are a data structure that can be used in place of balanced trees. Skip lists use probabilistic balancing rather than strictly enforced balancing and as a result the algorithms for insertion and deletion in skip lists are much simpler and significantly faster than equivalent algorithms for balanced trees.
>
> A skip list is a data structure that can be used to replace a balanced tree. Skip lists use probabilistic balancing rather than strictly enforced balancing, so the insertion and deletion algorithms in skip lists are much simpler and faster than the equivalent algorithms for balanced trees.

The author has also posted the core code of the AVL tree insertion operation here. It can be seen that each addition operation requires a recursive positioning to locate the insertion position, and then it is necessary to trace back to the root node to check whether the nodes at each layer along the way are unbalanced, and then adjust the nodes by rotating them.

```java
//Add new elements (key, value) to the binary search tree
public void add(K key, V value) {
    root = add(root, key, value);
}

// Insert elements (key, value) into the binary search tree rooted at node, recursive algorithm
// Return the root of the binary search tree after inserting the new node
private Node add(Node node, K key, V value) {

    if (node == null) {
        size++;
        return new Node(key, value);
    }

    if (key.compareTo(node.key) < 0)
        node.left = add(node.left, key, value);
    else if (key.compareTo(node.key) > 0)
        node.right = add(node.right, key, value);
    else // key.compareTo(node.key) == 0
        node.value = value;

    node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));

    int balanceFactor = getBalanceFactor(node);

    // LL type requires right-hand rotation
    if (balanceFactor > 1 && getBalanceFactor(node.left) >= 0) {
        return rightRotate(node);
    }

    //RR type imbalance requires left rotation
    if (balanceFactor < -1 && getBalanceFactor(node.right) <= 0) {
        return leftRotate(node);
    }

    //LR needs to be rotated left first into LL shape, and then rotated right
    if (balanceFactor > 1 && getBalanceFactor(node.left) < 0) {
        node.left = leftRotate(node.left);
        return rightRotate(node);
    }

    //RL
    if (balanceFactor < -1 && getBalanceFactor(node.right) > 0) {
        node.right = rightRotate(node.right);
        return leftRotate(node);
    }
    return node;
}
```

### Red-black tree vs jump list

Red Black Tree is also a self-balancing binary search tree. Its query performance is slightly inferior to AVL tree, but insertion and deletion are more efficient. The time complexity of insertion, deletion and query of red-black tree is the same as that of skip table **O(log n)**.

A red-black tree is a **black balanced tree**, that is, from any node to another leaf node, the black nodes it passes through are the same. When inserting it, it needs to be rotated and dyed (red-to-black conversion) to ensure black balance. However, the overhead of maintaining balance is smaller than that of an AVL tree. For a detailed introduction to red-black trees, you can view this article: [Red-Black Tree](https://javaguide.cn/cs-basics/data-structure/red-black-tree.html).

Compared with red-black trees, the implementation of skip tables is also simpler. Moreover, when searching for data according to intervals, the efficiency of red-black trees is not as high as that of jump tables.

![](https://oss.javaguide.cn/javaguide/database/redis/skiplist/202401222005709.png)

The core code added corresponding to the red-black tree is as follows, readers can refer to and understand by themselves:

```java
private Node < K, V > add(Node < K, V > node, K key, V val) {

    if (node == null) {
        size++;
        return new Node(key, val);

    }

    if (key.compareTo(node.key) < 0) {
        node.left = add(node.left, key, val);
    } else if (key.compareTo(node.key) > 0) {
        node.right = add(node.right, key, val);
    } else {
        node.val = val;
    }

    //The left node is not red, the right node is red, left rotation
    if (isRed(node.right) && !isRed(node.left)) {
        node = leftRotate(node);
    }

    //Left chain right-hand rotation
    if (isRed(node.left) && isRed(node.left.left)) {
        node = rightRotate(node);
    }

    //color flip
    if (isRed(node.left) && isRed(node.right)) {
        flipColors(node);
    }

    return node;
}```

### B+ tree vs skip list

Readers who use MySQL must know the data structure of B+ tree. B+ tree is a commonly used data structure with the following characteristics:

1. **Multi-fork tree structure**: It is a multi-fork tree. Each node can contain multiple child nodes, which reduces the height of the tree and has high query efficiency.
2. **High storage efficiency**: Non-leaf nodes store multiple keys, and leaf nodes store values, so that each node can store more keys, and the query efficiency is higher when performing range queries based on the index. -
3. **Balance**: It is absolutely balanced, that is, the height of each branch of the tree is not much different, ensuring that the query and insertion time complexity is **O(log n)**.
4. **Sequential access**: Leaf nodes are connected through linked list pointers, and range queries perform well.
5. **Uniform distribution of data**: B+ tree insertion may cause data to be redistributed, making the data more evenly distributed throughout the tree and ensuring range query and deletion efficiency.

![](https://oss.javaguide.cn/javaguide/database/redis/skiplist/202401222005649.png)

Therefore, B+ tree is more suitable as one of the commonly used index structures in databases and file systems. Its core idea is to obtain query data by locating as many indexes as possible with as little IO as possible. For in-memory databases such as Redis, it is not interested in these, because Redis, as an in-memory database, cannot store a large amount of data, so the index does not need to be maintained through B+ trees. It only needs to be randomly maintained according to probability, saving memory. Moreover, using skip tables to implement zset is simpler than the former. When inserting, you only need to insert the data into the appropriate position in the linked list through the index and then randomly maintain an index of a certain height. There is no need to split and merge nodes when an imbalance is found during insertion like the B+ tree.

### Reasons given by the author of Redis

Of course, we can also use the reasons given by the author of Redis himself:

> There are a few reasons:
> 1. They are not very memory intensive. It's up to you basically. Changing parameters about the probability of a node to have a given number of levels will make then less memory intensive than btrees.
> 2. A sorted set is often target of many ZRANGE or ZREVRANGE operations, that is, traversing the skip list as a linked list. With this operation the cache locality of skip lists is at least as good as with other kind of balanced trees.
> 3. They are simpler to implement, debug, and so forth. For instance thanks to the skip list simplicity I received a patch (already in Redis master) with augmented skip lists implementing ZRANK in O(log(N)). It requires little changes to the code.

Translated it means:

> There are several reasons:
>
> 1. They don’t take up much memory. It's mostly up to you. Changing the parameters of a node's probability of having a given number of levels makes them more memory efficient than B-trees.
>
> 2. Sorted sets are often the target of many ZRANGE or ZREVRANGE operations, that is, traversing the jump list in a linked list. With this operation, the cache locality of skip lists is at least as good as other types of balanced trees.
>
> 3. They are easier to implement, debug, etc. For example, due to the simplicity of skip tables, I received a patch (already in the Redis master branch) to achieve O(log(N)) ZRANK with enhanced skip tables. It requires only minimal modifications to the code.

## Summary

This article introduces the working principle and implementation of skip tables through a large amount of space to help readers become more familiar with the advantages and disadvantages of the skip table data structure. Finally, it compares the characteristics of each data structure operation to help readers better understand this interview question. It is recommended that when readers understand skip tables, they should cooperate with writing simulations as much as possible to understand the detailed process of adding, deleting, modifying and checking skip tables.

## Reference

- Why does redis use skiplist instead of red-black? :<https://www.zhihu.com/question/20202931/answer/16086538>
- Skip List--Skip List (one of the most detailed skip list articles on the entire Internet): <https://www.jianshu.com/p/9d8296562806>
- Detailed explanation of Redis objects and underlying data structures: <https://blog.csdn.net/shark_chili3007/article/details/104171986>
- Redis ordered set (sorted set): <https://www.runoob.com/redis/redis-sorted-sets.html>
- Comparison of red-black trees and skip tables: <https://zhuanlan.zhihu.com/p/576984787>
- Why does redis's zset use jump tables instead of b+ trees? :<https://blog.csdn.net/f80407515/article/details/129136998>