---
title: LRU 缓存面试题总结：哈希表、双向链表与 LinkedHashMap
description: LRU 缓存面试题总结，讲解 LRU 淘汰策略、哈希表加双向链表实现、Java LinkedHashMap 写法、复杂度和缓存场景。
category: 计算机基础
tag:
  - 数据结构
head:
  - - meta
    - name: keywords
      content: LRU缓存,LRU,缓存淘汰,哈希表,双向链表,LinkedHashMap,Java LRU,页面置换,数据结构面试题
---

LRU 是 Least Recently Used 的缩写，意思是最近最少使用。当缓存容量满了，需要淘汰最久没有被访问的数据。

面试里手写 LRU 很高频，因为它把哈希表和双向链表结合在一起：哈希表负责 `O(1)` 查找节点，双向链表负责 `O(1)` 移动节点和删除尾节点。

## 面试考察重点

- 能说清为什么只用哈希表或只用链表都不够。
- 能写 `get` 和 `put`。
- 能解释双向链表头尾分别代表什么。
- 能处理容量满、更新已有 key、删除尾节点等边界。
- 能知道 Java `LinkedHashMap` 可以实现 LRU。

## 数据结构设计

| 组件                     | 作用                                             |
| ------------------------ | ------------------------------------------------ |
| `HashMap<Integer, Node>` | 根据 key 快速找到链表节点                        |
| 双向链表                 | 按访问时间排序，头部是最近使用，尾部是最久未使用 |
| 虚拟头尾节点             | 简化插入和删除边界                               |

访问一个 key 后，需要把它移动到链表头部。插入新 key 时，也放到头部。容量超限时，删除尾部前一个节点。

## 面试手写路径

LRU 的代码细节多，建议不要一上来就写完整类。面试时可以先把操作拆开：

1. 先定义链表顺序：头部表示最近使用，尾部表示最久未使用。
2. 再定义 `get`：查不到返回 `-1`，查到后移动到头部。
3. 再定义 `put`：已有 key 更新值并移动到头部；新 key 插入头部。
4. 最后处理淘汰：超过容量后删除尾部前一个节点，并从哈希表删除。
5. 把链表操作封装成 `addToHead`、`remove`、`moveToHead`、`removeTail`。

这样写的好处是，`get` 和 `put` 都只组合几个基础链表操作，不会在主流程里反复改指针，出错概率低很多。

## 手写 LRU

```java
class LRUCache {
    private final int capacity;
    private final Map<Integer, Node> map = new HashMap<>();
    private final Node head = new Node(0, 0);
    private final Node tail = new Node(0, 0);

    LRUCache(int capacity) {
        this.capacity = capacity;
        head.next = tail;
        tail.prev = head;
    }

    int get(int key) {
        Node node = map.get(key);
        if (node == null) {
            return -1;
        }
        moveToHead(node);
        return node.value;
    }

    void put(int key, int value) {
        Node node = map.get(key);
        if (node != null) {
            node.value = value;
            moveToHead(node);
            return;
        }
        Node newNode = new Node(key, value);
        map.put(key, newNode);
        addToHead(newNode);
        if (map.size() > capacity) {
            Node removed = removeTail();
            map.remove(removed.key);
        }
    }

    private void moveToHead(Node node) {
        remove(node);
        addToHead(node);
    }

    private void addToHead(Node node) {
        node.prev = head;
        node.next = head.next;
        head.next.prev = node;
        head.next = node;
    }

    private void remove(Node node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    private Node removeTail() {
        Node node = tail.prev;
        remove(node);
        return node;
    }

    private static class Node {
        int key;
        int value;
        Node prev;
        Node next;

        Node(int key, int value) {
            this.key = key;
            this.value = value;
        }
    }
}
```

`get` 和 `put` 的时间复杂度都是 `O(1)`，空间复杂度是 `O(capacity)`。

## 操作过程示意

假设容量为 2，按顺序执行：

```text
put(1, 1)
put(2, 2)
get(1)
put(3, 3)
```

链表状态变化如下，左侧表示最近使用：

| 操作        | 链表状态 | 说明                     |
| ----------- | -------- | ------------------------ |
| 初始状态    | 空       | 虚拟头尾相连，缓存为空   |
| `put(1, 1)` | `1`      | 新节点插入头部           |
| `put(2, 2)` | `2 -> 1` | `2` 是最近使用           |
| `get(1)`    | `1 -> 2` | 访问 `1` 后移动到头部    |
| `put(3, 3)` | `3 -> 1` | 容量超限，淘汰尾部的 `2` |

这张表能帮助检查两个点：访问已有节点要更新使用顺序；淘汰节点时，删除的是最久未使用的尾部节点，而不是刚插入的新节点。

## LinkedHashMap 实现

Java 的 `LinkedHashMap` 支持按访问顺序维护元素：

```java
class LRUCacheWithLinkedHashMap extends LinkedHashMap<Integer, Integer> {
    private final int capacity;

    LRUCacheWithLinkedHashMap(int capacity) {
        super(capacity, 0.75f, true);
        this.capacity = capacity;
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry<Integer, Integer> eldest) {
        return size() > capacity;
    }
}
```

构造函数里的第三个参数 `accessOrder` 设置为 `true`，表示按照访问顺序排序，而不是插入顺序。

## 工程场景

- 本地缓存淘汰。
- 操作系统页面置换。
- 热点数据缓存。
- 网关、客户端 SDK 或中间件里的小容量结果缓存。

真实工程里还要考虑线程安全、过期时间、最大内存、统计指标和淘汰回调。面试手写 LRU 主要考数据结构组合，不需要把这些都写进代码。

## 面试追问

| 追问                           | 回答重点                                                               |
| ------------------------------ | ---------------------------------------------------------------------- |
| 为什么不用单独的 `HashMap`？   | `HashMap` 能查值，但不知道谁最久没被使用                               |
| 为什么不用单独的链表？         | 链表能维护顺序，但按 key 查找节点需要 `O(n)`                           |
| 为什么要用双向链表？           | 删除任意节点时需要同时连接前驱和后继，单向链表无法 `O(1)` 找到前驱     |
| 为什么要用虚拟头尾节点？       | 统一空链表、头节点、尾节点的插入删除逻辑，减少分支判断                 |
| `LinkedHashMap` 怎么实现 LRU？ | 构造时开启 `accessOrder`，重写 `removeEldestEntry` 控制容量            |
| 真实缓存还要考虑什么？         | 线程安全、过期时间、最大内存、淘汰回调、命中率统计和缓存击穿等工程问题 |

## 易错点

- 更新已有 key 时，也要移动到头部。
- 删除尾节点后，别忘了从哈希表里删除 key。
- 双向链表删除节点时要同时改前后两个指针。
- 虚拟头尾节点可以减少空链表边界判断。
- `LinkedHashMap` 的 `accessOrder` 要设为 `true`。

## 高频问题自测

- LRU 为什么需要哈希表和双向链表配合？
- `get` 操作为什么也要移动节点？
- 更新已有 key 时，为什么不能只改 value？
- 淘汰尾节点后，为什么还要从哈希表删除 key？
- `LinkedHashMap` 的插入顺序和访问顺序有什么区别？

## 推荐练习题

- [146. LRU 缓存](https://leetcode.cn/problems/lru-cache/)
- [460. LFU 缓存](https://leetcode.cn/problems/lfu-cache/)

<!-- @include: @article-footer.snippet.md -->
