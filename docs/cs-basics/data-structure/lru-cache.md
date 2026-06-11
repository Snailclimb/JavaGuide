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

## 易错点

- 更新已有 key 时，也要移动到头部。
- 删除尾节点后，别忘了从哈希表里删除 key。
- 双向链表删除节点时要同时改前后两个指针。
- 虚拟头尾节点可以减少空链表边界判断。
- `LinkedHashMap` 的 `accessOrder` 要设为 `true`。

## 推荐练习题

- [146. LRU 缓存](https://leetcode.cn/problems/lru-cache/)
- [460. LFU 缓存](https://leetcode.cn/problems/lfu-cache/)

<!-- @include: @article-footer.snippet.md -->
