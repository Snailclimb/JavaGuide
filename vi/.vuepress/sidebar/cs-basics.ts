import { ICONS, createImportantSection } from "./constants.js";

export const csBasics = [
  {
    text: "Network",
    prefix: "network/",
    icon: ICONS.NETWORK,
    children: [
      {
        text: "Câu hỏi phỏng vấn",
        icon: ICONS.INTERVIEW,
        children: [
          {
            text: "⭐️Tổng hợp câu hỏi phỏng vấn Computer Network thường gặp (phần 1)",
            link: "other-network-questions",
          },
          {
            text: "⭐️Tổng hợp câu hỏi phỏng vấn Computer Network thường gặp (phần 2)",
            link: "other-network-questions2",
          },
          // { text: "Tổng hợp kiến thức Computer Network", link: "computer-network-xiexiren-summary" },
        ],
      },
      {
        text: "Cơ bản",
        icon: ICONS.STAR,
        collapsible: true,
        children: [
          {
            text: "Giải thích chi tiết mô hình OSI 7 tầng và TCP/IP 4 tầng",
            link: "osi-and-tcp-ip-model",
          },
          {
            text: "Từ lúc nhập URL đến khi trang hiển thị, thực sự đã xảy ra chuyện gì?",
            link: "the-whole-process-of-accessing-web-pages",
          },
        ],
      },
      {
        text: "Tầng Application",
        icon: ICONS.CODE,
        collapsible: true,
        children: [
          {
            text: "⭐️Tổng hợp các giao thức tầng Application thường gặp",
            link: "application-layer-protocol",
          },
          { text: "⭐️HTTP vs HTTPS", link: "http-vs-https" },
          { text: "⭐️Đã có HTTP, tại sao vẫn cần RPC?", link: "http-vs-rpc" },
          {
            text: "RSA và ECDHE trong HTTPS handshake",
            link: "https-rsa-vs-ecdhe",
          },
          { text: "HTTP 1.0 vs HTTP 1.1", link: "http1.0-vs-http1.1" },
          {
            text: "Tổng hợp các HTTP status code thường gặp",
            link: "http-status-codes",
          },
          { text: "Giải thích chi tiết DNS", link: "dns" },
        ],
      },
      {
        text: "Tầng Transport",
        icon: ICONS.NETWORK,
        collapsible: true,
        children: [
          {
            text: "⭐️TCP three-way handshake và four-way handshake",
            link: "tcp-connection-and-disconnection",
          },
          { text: "Giải thích chi tiết TCP TIME_WAIT", link: "tcp-time-wait" },
          {
            text: "TCP Keepalive và HTTP Keep-Alive khác nhau thế nào?",
            link: "tcp-keepalive-vs-http-keepalive",
          },
          {
            text: "TCP byte stream vs UDP datagram",
            link: "tcp-byte-stream-udp-datagram",
          },
          {
            text: "⭐️TCP đảm bảo truyền tin tin cậy như thế nào?",
            link: "tcp-reliability-guarantee",
          },
          {
            text: "Ping được thì TCP có chắc chắn kết nối được không?",
            link: "can-ping-but-tcp-may-not-connect",
          },
          {
            text: "TCP và UDP có thể dùng chung một port không?",
            link: "can-tcp-and-udp-use-the-same-port",
          },
          {
            text: "Một máy chủ có thể duy trì tối đa bao nhiêu TCP connection?",
            link: "maximum-number-of-tcp-connections-per-host",
          },
        ],
      },
      {
        text: "Tầng Network",
        icon: ICONS.NETWORK,
        collapsible: true,
        children: [
          { text: "Giải thích chi tiết giao thức ARP", link: "arp" },
          { text: "Giải thích chi tiết giao thức NAT", link: "nat" },
        ],
      },
      {
        text: "Security",
        icon: ICONS.SECURITY,
        collapsible: true,
        children: [
          {
            text: "Tổng hợp các hình thức tấn công mạng thường gặp",
            link: "network-attack-means",
          },
        ],
      },
    ],
  },
  {
    text: "Operating System",
    prefix: "operating-system/",
    icon: ICONS.OS,
    children: [
      {
        text: "Câu hỏi phỏng vấn",
        icon: ICONS.INTERVIEW,
        children: [
          {
            text: "⭐️Tổng hợp câu hỏi phỏng vấn Operating System thường gặp (phần 1)",
            link: "operating-system-basic-questions-01",
          },
          {
            text: "⭐️Tổng hợp câu hỏi phỏng vấn Operating System thường gặp (phần 2)",
            link: "operating-system-basic-questions-02",
          },
        ],
      },
      {
        text: "Chắc chắn hỏi khi phỏng vấn",
        icon: ICONS.STAR,
        children: [
          {
            text: "⭐️Giải thích chi tiết virtual memory",
            link: "virtual-memory",
          },
          {
            text: "⭐️Giải thích chi tiết I/O multiplexing",
            link: "io-multiplexing",
          },
          { text: "⭐️Giải thích chi tiết zero-copy", link: "zero-copy" },
        ],
      },
      {
        text: "Bộ nhớ và file system",
        icon: ICONS.OS,
        collapsible: true,
        children: [
          {
            text: "Giải thích chi tiết memory management",
            link: "memory-management",
          },
          { text: "Giải thích chi tiết file system", link: "file-system" },
        ],
      },
      {
        text: "Process và Thread",
        icon: ICONS.STAR,
        collapsible: true,
        children: [
          {
            text: "⭐️Giải thích chi tiết Process và Thread",
            link: "process-and-thread",
          },
          { text: "⭐️Lock và cơ chế đồng bộ", link: "os-lock-and-sync" },
          { text: "⭐️Giải thích chi tiết deadlock", link: "dead-lock" },
          {
            text: "Interrupt, exception và system call",
            link: "interrupt-exception-syscall",
          },
          {
            text: "CPU scheduling và system load",
            link: "cpu-scheduling-and-load",
          },
          {
            text: "Giải thích chi tiết Inter-Process Communication (IPC)",
            link: "ipc",
          },
        ],
      },
      {
        text: "Linux",
        icon: ICONS.LINUX,
        children: [
          { text: "Tổng hợp kiến thức cơ bản Linux", link: "linux-intro" },
          {
            text: "Tổng hợp kiến thức cơ bản Shell programming",
            link: "shell-intro",
          },
        ],
      },
    ],
  },
  {
    text: "Data Structure",
    prefix: "data-structure/",
    icon: ICONS.DATA_STRUCTURE,
    collapsible: true,
    children: [
      {
        text: "Hệ thống kiến thức",
        link: "/cs-basics/data-structure/",
      },
      {
        text: "Cấu trúc cơ bản",
        collapsible: true,
        children: [
          { text: "Linear Data Structure", link: "linear-data-structure" },
          { text: "⭐️Hash Table", link: "hash-table" },
        ],
      },
      {
        text: "Tree và Heap",
        collapsible: true,
        children: [
          { text: "⭐️Cấu trúc Tree", link: "tree" },
          { text: "⭐️Heap", link: "heap" },
          { text: "Red-Black Tree", link: "red-black-tree" },
        ],
      },
      {
        text: "Graph và Set",
        collapsible: true,
        children: [
          { text: "Graph", link: "graph" },
          { text: "⭐️Union-Find", link: "union-find" },
        ],
      },
      {
        text: "String và sorted index",
        collapsible: true,
        children: [
          { text: "Trie (Prefix Tree)", link: "trie" },
          { text: "Skip List", link: "skip-list" },
        ],
      },
      {
        text: "Cấu trúc hướng kỹ thuật",
        collapsible: true,
        children: [
          { text: "⭐️Bloom Filter", link: "bloom-filter" },
          { text: "⭐️LRU Cache", link: "lru-cache" },
        ],
      },
    ],
  },
  {
    text: "Algorithm",
    prefix: "algorithms/",
    icon: ICONS.ALGORITHM,
    collapsible: true,
    children: [
      { text: "Phân tích độ phức tạp", link: "complexity-analysis" },
      { text: "Binary Search", link: "binary-search" },
      {
        text: "Two Pointers và Sliding Window",
        link: "two-pointers-and-sliding-window",
      },
      { text: "DFS và BFS", link: "dfs-bfs" },
      { text: "Backtracking", link: "backtracking" },
      { text: "Dynamic Programming", link: "dynamic-programming" },
      { text: "Greedy Algorithm", link: "greedy" },
      { text: "Bài toán Top K", link: "top-k" },
      {
        text: "Tư tưởng thuật toán kinh điển",
        link: "classical-algorithm-problems-recommendations",
      },
      {
        text: "Data Structure trên LeetCode",
        link: "common-data-structures-leetcode-recommendations",
      },
      {
        text: "Bài toán thuật toán về chuỗi",
        link: "string-algorithm-problems",
      },
      {
        text: "Bài toán thuật toán về linked list",
        link: "linkedlist-algorithm-problems",
      },
      {
        text: "Coding Interviews (Jianzhi Offer)",
        link: "the-sword-refers-to-offer",
      },
      {
        text: "Thuật toán sắp xếp kinh điển",
        link: "10-classical-sorting-algorithms",
      },
    ],
  },
];
