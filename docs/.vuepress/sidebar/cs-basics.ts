import { ICONS, createImportantSection } from "./constants.js";

export const csBasics = [
  {
    text: "网络",
    prefix: "network/",
    icon: ICONS.NETWORK,
    children: [
      {
        text: "面试题",
        icon: ICONS.INTERVIEW,
        children: [
          {
            text: "⭐️计算机网络常见面试题总结（上）",
            link: "other-network-questions",
          },
          {
            text: "⭐️计算机网络常见面试题总结（下）",
            link: "other-network-questions2",
          },
          // { text: "计算机网络知识总结", link: "computer-network-xiexiren-summary" },
        ],
      },
      {
        text: "基础",
        icon: ICONS.STAR,
        children: [
          {
            text: "OSI 七层模型与 TCP/IP 四层模型详解",
            link: "osi-and-tcp-ip-model",
          },
          {
            text: "从输入 URL 到页面展示到底发生了什么？",
            link: "the-whole-process-of-accessing-web-pages",
          },
        ],
      },
      {
        text: "应用层",
        icon: ICONS.CODE,
        children: [
          { text: "⭐️应用层常见协议总结", link: "application-layer-protocol" },
          { text: "⭐️HTTP vs HTTPS", link: "http-vs-https" },
          { text: "⭐️有了HTTP，为什么还要RPC？", link: "http-vs-rpc" },
          {
            text: "HTTPS 握手里的 RSA 和 ECDHE",
            link: "https-rsa-vs-ecdhe",
          },
          { text: "HTTP 1.0 vs HTTP 1.1", link: "http1.0-vs-http1.1" },
          { text: "HTTP 常见状态码总结", link: "http-status-codes" },
          { text: "DNS 域名系统详解", link: "dns" },
        ],
      },
      {
        text: "传输层",
        icon: ICONS.NETWORK,
        children: [
          {
            text: "⭐️TCP 三次握手和四次挥手",
            link: "tcp-connection-and-disconnection",
          },
          { text: "TCP TIME_WAIT 详解", link: "tcp-time-wait" },
          {
            text: "TCP Keepalive和HTTP Keep-Alive有什么区别？",
            link: "tcp-keepalive-vs-http-keepalive",
          },
          {
            text: "TCP 字节流 vs UDP 报文",
            link: "tcp-byte-stream-udp-datagram",
          },
          {
            text: "⭐️TCP 如何保证可靠传输？",
            link: "tcp-reliability-guarantee",
          },
          {
            text: "能 Ping 通，TCP 就一定能连通吗？",
            link: "can-ping-but-tcp-may-not-connect",
          },
          {
            text: "TCP 和 UDP 可以使用同一个端口吗？",
            link: "can-tcp-and-udp-use-the-same-port",
          },
          {
            text: "一台主机最多能保持多少个 TCP 连接？",
            link: "maximum-number-of-tcp-connections-per-host",
          },
        ],
      },
      {
        text: "网络层",
        icon: ICONS.NETWORK,
        children: [
          { text: "ARP 协议详解", link: "arp" },
          { text: "NAT 协议详解", link: "nat" },
        ],
      },
      {
        text: "安全",
        icon: ICONS.SECURITY,
        children: [
          { text: "网络攻击常见手段总结", link: "network-attack-means" },
        ],
      },
    ],
  },
  {
    text: "操作系统",
    prefix: "operating-system/",
    icon: ICONS.OS,
    children: [
      {
        text: "面试题",
        icon: ICONS.INTERVIEW,
        children: [
          {
            text: "⭐️操作系统常见面试题总结（上）",
            link: "operating-system-basic-questions-01",
          },
          {
            text: "⭐️操作系统常见面试题总结（下）",
            link: "operating-system-basic-questions-02",
          },
        ],
      },
      {
        text: "面试必考",
        icon: ICONS.STAR,
        children: [
          { text: "⭐️虚拟内存详解", link: "virtual-memory" },
          { text: "⭐️I/O 多路复用详解", link: "io-multiplexing" },
          { text: "⭐️零拷贝详解", link: "zero-copy" },
        ],
      },
      {
        text: "进程与线程",
        icon: ICONS.STAR,
        children: [
          { text: "⭐️进程与线程详解", link: "process-and-thread" },
          { text: "进程间通信（IPC）详解", link: "ipc" },
        ],
      },
      {
        text: "Linux",
        icon: ICONS.LINUX,
        children: [
          { text: "Linux 基础知识总结", link: "linux-intro" },
          { text: "Shell 编程基础知识总结", link: "shell-intro" },
        ],
      },
    ],
  },
  {
    text: "数据结构",
    prefix: "data-structure/",
    icon: ICONS.DATA_STRUCTURE,
    collapsible: true,
    children: [
      { text: "线性数据结构", link: "linear-data-structure" },
      { text: "哈希表", link: "hash-table" },
      { text: "树结构", link: "tree" },
      { text: "图", link: "graph" },
      { text: "堆", link: "heap" },
      { text: "Trie 前缀树", link: "trie" },
      { text: "并查集", link: "union-find" },
      { text: "跳表", link: "skip-list" },
      { text: "红黑树", link: "red-black-tree" },
      { text: "布隆过滤器", link: "bloom-filter" },
      { text: "LRU 缓存", link: "lru-cache" },
    ],
  },
  {
    text: "算法",
    prefix: "algorithms/",
    icon: ICONS.ALGORITHM,
    collapsible: true,
    children: [
      { text: "复杂度分析", link: "complexity-analysis" },
      { text: "二分查找", link: "binary-search" },
      { text: "双指针与滑动窗口", link: "two-pointers-and-sliding-window" },
      { text: "DFS 与 BFS", link: "dfs-bfs" },
      { text: "回溯算法", link: "backtracking" },
      { text: "动态规划", link: "dynamic-programming" },
      { text: "贪心算法", link: "greedy" },
      { text: "Top K 问题", link: "top-k" },
      {
        text: "经典算法思想",
        link: "classical-algorithm-problems-recommendations",
      },
      {
        text: "数据结构 LeetCode",
        link: "common-data-structures-leetcode-recommendations",
      },
      { text: "字符串算法题", link: "string-algorithm-problems" },
      { text: "链表算法题", link: "linkedlist-algorithm-problems" },
      { text: "剑指 Offer", link: "the-sword-refers-to-offer" },
      { text: "经典排序算法", link: "10-classical-sorting-algorithms" },
    ],
  },
];
