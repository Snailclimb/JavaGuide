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
            text: "TCP 字节流 vs UDP 报文",
            link: "tcp-byte-stream-udp-datagram",
          },
          { text: "⭐️TCP 传输可靠性保障", link: "tcp-reliability-guarantee" },
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
      "operating-system-basic-questions-01",
      "operating-system-basic-questions-02",
      {
        text: "Linux",
        icon: ICONS.LINUX,
        children: ["linux-intro", "shell-intro"],
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
      { text: "树结构", link: "tree" },
      { text: "图", link: "graph" },
      { text: "堆", link: "heap" },
      { text: "红黑树", link: "red-black-tree" },
      { text: "布隆过滤器", link: "bloom-filter" },
    ],
  },
  {
    text: "算法",
    prefix: "algorithms/",
    icon: ICONS.ALGORITHM,
    collapsible: true,
    children: [
      "classical-algorithm-problems-recommendations",
      "common-data-structures-leetcode-recommendations",
      "string-algorithm-problems",
      "linkedlist-algorithm-problems",
      "the-sword-refers-to-offer",
      "10-classical-sorting-algorithms",
    ],
  },
];
