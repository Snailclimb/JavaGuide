---
title: TCP 和 UDP 可以使用同一个端口吗？
description: 讲清 TCP 和 UDP 是否可以使用同一个端口，以及端口空间、绑定规则和常见例子。
category: 计算机基础
tag:
  - 计算机网络
head:
  - - meta
    - name: keywords
      content: TCP,UDP,端口,socket,bind,DNS 53,HTTP3,QUIC,UDP 443
---

面试里经常会碰到这个问题：一台机器上，TCP 已经监听了 `8080`，UDP 还能不能再监听 `8080`？

先说结论：**可以。TCP 和 UDP 的端口绑定命名空间按传输层协议区分，同一个数字端口在不同协议下不冲突。** 一个进程监听 `TCP/8080`，另一个进程监听 `UDP/8080`，内核会根据协议栈分别分发。

## 端口号到底归谁管？

端口是传输层用来区分应用进程的编号。IP 地址定位主机，端口号定位这台主机上的具体应用。

TCP 和 UDP 报文头里都有源端口和目的端口字段，字段长度都是 16 位（16 bits），所以端口号范围都是 `0~65535`。不过端口 `0` 在实际 API 里通常有特殊含义，比如让系统自动分配临时端口，不适合作为普通服务监听端口讲解。

**数字范围相同，不代表绑定对象相同**。服务注册、监听、抓包、防火墙和安全组规则里，通常都要把传输层协议和端口一起看，比如 `TCP/53`、`UDP/53`、`TCP/443`、`UDP/443`。

`TCP/443` 和 `UDP/443` 只是数字一样，协议栈处理路径不同。收到 IP 包后，内核会先看 IP 层的协议标识：IPv4 里是 Protocol 字段，IPv6 里对应 Next Header。TCP 的协议号是 `6`，UDP 是 `17`。在进入端口分发之前，内核已经根据协议号把报文交给对应的 TCP 或 UDP 协议栈。

![内核协议分发流程](https://oss.javaguide.cn/github/javaguide/cs-basics/network/can-tcp-and-udp-use-the-same-port-kernel-protocol-dispatching-process.png)

TCP 和 UDP 虽然都在传输层，但差异很大。下表从 8 个维度对比一下，方便建立整体认知：

| 特性         | TCP                                           | UDP                                 |
| ------------ | --------------------------------------------- | ----------------------------------- |
| **连接性**   | 面向连接（三次握手建连、四次挥手释放）        | 无连接，直接发                      |
| **可靠性**   | 可靠（序列号、ACK、重传、流量控制、拥塞控制） | 不可靠，尽最大努力交付              |
| **状态维护** | 有状态，维护连接信息                          | 无状态，发完就不管了                |
| **传输效率** | 较低（建连、确认、重传开销大）                | 较高（结构简单、开销小）            |
| **传输形式** | 面向字节流，不保留消息边界                    | 面向报文，天然保留消息边界          |
| **首部开销** | 20~60 字节                                    | 固定 8 字节                         |
| **通信模式** | 点对点（单播）                                | 单播、多播、广播都支持              |
| **常见应用** | HTTP/HTTPS、FTP、SMTP、SSH                    | DNS、DHCP、SNMP、TFTP、VoIP、视频流 |

正因为 TCP 和 UDP 是两套完全独立的传输层协议，内核才会在端口分发之前先把它们分开处理。

## socket 绑定时为什么不冲突？

服务端程序通常会先创建 socket，再通过 `bind()` 绑定本地 IP 和端口。一个 TCP socket 绑定 `8080`，另一个 UDP socket 也绑定 `8080`，通常可以同时存在。内核判断冲突时，不只看端口数字，还会看协议、本地地址等信息。

对于 TCP 来说，一条已建立连接通常可以用四元组标识：源 IP、源端口、目的 IP、目的端口。在防火墙、NAT、抓包和流量排查里，也常把传输层协议加进去，称为五元组：

```text
协议、源 IP、源端口、目的 IP、目的端口
```

两条通信的目的端口都可以是 `8080`，只要协议不同，内核就不会把它们当成同一条通信。UDP 没有 TCP 那种连接状态机，但收发数据时同样会带上源 IP、源端口、目的 IP、目的端口。

## 简单验证一下

可以用 `nc` 快速试一下。不过不同系统里的 `nc` 实现不完全一样，`-l`、`-u` 和端口参数写法可能有差异。以下是 OpenBSD netcat 常见写法，命令报错时可以先用 `nc -h` 看本机帮助。

先启动 TCP 监听：

```bash
nc -l 8000
```

再启动 UDP 监听：

```bash
nc -u -l 8000
```

两个命令可以同时存在。在 Linux 上可以再查看：

```bash
ss -tulnp | grep 8000
```

通常会看到一条 `tcp` 和一条 `udp` 监听，端口号一样，但协议不同。

如果想避开 `nc` 参数差异，也可以用代码验证：Java 里 `ServerSocket(8000)` 和 `DatagramSocket(8000)` 可以同时创建；Go 里 `net.Listen("tcp", ":8000")` 和 `net.ListenPacket("udp", ":8000")` 也可以同时存在。再用同一种协议重复监听一次，通常就会看到地址已被占用。

## 什么时候会冲突？

![端口什么情况下会冲突](https://oss.javaguide.cn/github/javaguide/cs-basics/network/when-does-tcp-conflict-occur.png)

TCP 和 UDP 之间不冲突，不代表端口可以随便重复绑定。

更常见的冲突发生在**同一个协议**里。比如一个进程已经绑定 `0.0.0.0:8080`，通常会覆盖本机所有 IPv4 地址上的 `8080`，另一个进程再绑定某个具体 IPv4 地址的 `TCP/8080` 往往会冲突；但最终行为还会受绑定顺序、`SO_REUSEADDR`、`SO_REUSEPORT` 和操作系统实现影响。

如果两个进程绑定的是不同本地 IP，同协议同端口也可能成立，例如 `192.168.1.10:8080` 和 `192.168.1.11:8080` 都是 TCP。

还有一个容易被忽略的点：IPv6 的通配地址 `[::]:8080` 在一些环境下可能同时接收 IPv6 和 IPv4-mapped 地址，`IPV6_V6ONLY` 会影响它是否和 IPv4 socket 冲突。排查时可以用 `ss -tulnp` 同时看 `0.0.0.0:端口` 和 `[::]:端口`。

`SO_REUSEADDR`、`SO_REUSEPORT` 也会改变绑定规则，常用于快速重启、多进程监听、负载分摊等场景。这里小 G 建议先记住：

**TCP 和 UDP 分别监听同一个数字端口，靠的是协议不同，不需要 `SO_REUSEPORT`。`SO_REUSEADDR` / `SO_REUSEPORT` 主要影响同一协议下的地址端口复用、快速重启和多进程监听，但是否允许、如何分流，要看操作系统和具体 socket 类型。**

## 分享两个实际案例

### DNS 为什么同时用 TCP/UDP 53？

![实际应用示例](https://oss.javaguide.cn/github/javaguide/cs-basics/network/can-tcp-and-udp-use-the-same-port-practical-application-example.png)

DNS 是最经典的例子。IANA 注册表里，`domain` 服务同时注册了 `TCP/53` 和 `UDP/53`，实际 DNS 服务也经常同时监听这两个端口。

日常域名查询通常走 UDP，因为查询和响应比较小，UDP 不需要建连，速度快。但以下几种情况会切换到 TCP：UDP 响应被截断（DNS 报文头 `TC` 标志位置 1，常见于响应超过 UDP 长度限制时）、区域传送（Zone Transfer，需要可靠传输保证数据完整性）、或者 DNSSEC 响应过大。这里不是“`UDP/53` 被占了，所以 `TCP/53` 不能用”，而是 DNS 本来就可以同时使用两套协议的 `53`。

### HTTPS 和 HTTP/3 的 443 也是这个道理

传统 HTTPS 通常是 HTTP/1.1 或 HTTP/2 over TLS over TCP，默认使用 `TCP/443`。HTTP/3 跑在 QUIC 上，而 QUIC 基于 UDP。浏览器通常会通过 `Alt-Svc` 或 `HTTPS` DNS 记录获知服务端支持 HTTP/3，然后尝试建立 QUIC 连接；常见部署是同时开放 `TCP/443` 和 `UDP/443`。

![HTTP/3 协议栈实现](https://oss.javaguide.cn/github/javaguide/cs-basics/network/http-3-implementation.png)

这不会和原来的 `TCP/443` 冲突。一个服务器完全可以同时提供：

```text
HTTPS（HTTP/1.1、HTTP/2） -> TCP/443
HTTP/3                  -> UDP/443
```

从外部看都是 `443`，从协议栈看是两条路。

生产环境里也要注意：只放行 `TCP/443` 时，HTTP/1.1 和 HTTP/2 可能都正常，但 HTTP/3 不会生效。云安全组、负载均衡、Nginx / 网关和主机防火墙都要分别检查 `TCP/443` 和 `UDP/443`，再用 `curl --http3` 或浏览器开发者工具确认协议是否真的切到 HTTP/3。

## 面试怎么回答？

TCP 和 UDP 可以使用同一个数字端口，因为它们是不同的传输层协议；内核会先按 IP 协议号分发到 TCP 栈或 UDP 栈，再在各自协议栈内按地址和端口找 socket，所以 `TCP/8080` 和 `UDP/8080` 可以共存。

真正容易冲突的是同协议下的绑定，比如两个 TCP 服务通常不能同时监听同一个本地 IP 和端口；这时才会涉及 `SO_REUSEADDR`、`SO_REUSEPORT` 这类 socket 复用选项。例子记两个就够了：DNS 同时使用 `UDP/53` 和 `TCP/53`；HTTP/3 常见部署是 `UDP/443`，可以和传统 HTTPS 的 `TCP/443` 同时存在。
