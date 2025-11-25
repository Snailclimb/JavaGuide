---
title: TCP 传输可靠性保障（传输层）
category: 计算机基础
tag:
  - 计算机网络
head:
  - - meta
    - name: keywords
      content: TCP,可靠性,重传,SACK,流量控制,拥塞控制,滑动窗口,校验和
  - - meta
    - name: description
      content: 系统梳理 TCP 的可靠性保障机制，覆盖重传/选择确认、流量与拥塞控制，明确端到端可靠传输的实现要点。
---

## TCP 如何保证传输的可靠性？

1. **基于数据块传输**：应用数据被分割成 TCP 认为最适合发送的数据块，再传输给网络层，数据块被称为报文段或段。
2. **对失序数据包重新排序以及去重**：TCP 为了保证不发生丢包，就给每个包一个序列号，有了序列号能够将接收到的数据根据序列号排序，并且去掉重复序列号的数据就可以实现数据包去重。
3. **校验和** : TCP 将保持它首部和数据的检验和。这是一个端到端的检验和，目的是检测数据在传输过程中的任何变化。如果收到段的检验和有差错，TCP 将丢弃这个报文段和不确认收到此报文段。
4. **重传机制** : 在数据包丢失或延迟的情况下，重新发送数据包，直到收到对方的确认应答（ACK）。TCP 重传机制主要有：基于计时器的重传（也就是超时重传）、快速重传（基于接收端的反馈信息来引发重传）、SACK（在快速重传的基础上，返回最近收到的报文段的序列号范围，这样客户端就知道，哪些数据包已经到达服务器了）、D-SACK（重复 SACK，在 SACK 的基础上，额外携带信息，告知发送方有哪些数据包自己重复接收了）。关于重传机制的详细介绍，可以查看[详解 TCP 超时与重传机制](https://zhuanlan.zhihu.com/p/101702312)这篇文章。
5. **流量控制** : TCP 连接的每一方都有固定大小的缓冲空间，TCP 的接收端只允许发送端发送接收端缓冲区能接纳的数据。当接收方来不及处理发送方的数据，能提示发送方降低发送的速率，防止包丢失。TCP 使用的流量控制协议是可变大小的滑动窗口协议（TCP 利用滑动窗口实现流量控制）。
6. **拥塞控制** : 当网络拥塞时，减少数据的发送。TCP 在发送数据的时候，需要考虑两个因素：一是接收方的接收能力，二是网络的拥塞程度。接收方的接收能力由滑动窗口表示，表示接收方还有多少缓冲区可以用来接收数据。网络的拥塞程度由拥塞窗口表示，它是发送方根据网络状况自己维护的一个值，表示发送方认为可以在网络中传输的数据量。发送方发送数据的大小是滑动窗口和拥塞窗口的最小值，这样可以保证发送方既不会超过接收方的接收能力，也不会造成网络的过度拥塞。

## TCP 如何实现流量控制？

**TCP 利用滑动窗口实现流量控制。流量控制是为了控制发送方发送速率，保证接收方来得及接收。** 接收方发送的确认报文中的窗口字段可以用来控制发送方窗口大小，从而影响发送方的发送速率。将窗口字段设置为 0，则发送方不能发送数据。

**为什么需要流量控制?** 这是因为双方在通信的时候，发送方的速率与接收方的速率是不一定相等，如果发送方的发送速率太快，会导致接收方处理不过来。如果接收方处理不过来的话，就只能把处理不过来的数据存在 **接收缓冲区(Receiving Buffers)** 里（失序的数据包也会被存放在缓存区里）。如果缓存区满了发送方还在狂发数据的话，接收方只能把收到的数据包丢掉。出现丢包问题的同时又疯狂浪费着珍贵的网络资源。因此，我们需要控制发送方的发送速率，让接收方与发送方处于一种动态平衡才好。

这里需要注意的是（常见误区）：

- 发送端不等同于客户端
- 接收端不等同于服务端

TCP 为全双工(Full-Duplex, FDX)通信，双方可以进行双向通信，客户端和服务端既可能是发送端又可能是服务端。因此，两端各有一个发送缓冲区与接收缓冲区，两端都各自维护一个发送窗口和一个接收窗口。接收窗口大小取决于应用、系统、硬件的限制（TCP 传输速率不能大于应用的数据处理速率）。通信双方的发送窗口和接收窗口的要求相同

**TCP 发送窗口可以划分成四个部分**：

1. 已经发送并且确认的 TCP 段（已经发送并确认）；
2. 已经发送但是没有确认的 TCP 段（已经发送未确认）；
3. 未发送但是接收方准备接收的 TCP 段（可以发送）；
4. 未发送并且接收方也并未准备接受的 TCP 段（不可发送）。

**TCP 发送窗口结构图示**：

![TCP发送窗口结构](https://oss.javaguide.cn/github/javaguide/cs-basics/network/tcp-send-window.png)

- **SND.WND**：发送窗口。
- **SND.UNA**：Send Unacknowledged 指针，指向发送窗口的第一个字节。
- **SND.NXT**：Send Next 指针，指向可用窗口的第一个字节。

**可用窗口大小** = `SND.UNA + SND.WND - SND.NXT` 。

**TCP 接收窗口可以划分成三个部分**：

1. 已经接收并且已经确认的 TCP 段（已经接收并确认）；
2. 等待接收且允许发送方发送 TCP 段（可以接收未确认）；
3. 不可接收且不允许发送方发送 TCP 段（不可接收）。

**TCP 接收窗口结构图示**：

![TCP接收窗口结构](https://oss.javaguide.cn/github/javaguide/cs-basics/network/tcp-receive-window.png)

**接收窗口的大小是根据接收端处理数据的速度动态调整的。** 如果接收端读取数据快，接收窗口可能会扩大。 否则，它可能会缩小。

另外，这里的滑动窗口大小只是为了演示使用，实际窗口大小通常会远远大于这个值。

## TCP 的拥塞控制是怎么实现的？

在某段时间，若对网络中某一资源的需求超过了该资源所能提供的可用部分，网络的性能就要变坏。这种情况就叫拥塞。拥塞控制就是为了防止过多的数据注入到网络中，这样就可以使网络中的路由器或链路不致过载。拥塞控制所要做的都有一个前提，就是网络能够承受现有的网络负荷。拥塞控制是一个全局性的过程，涉及到所有的主机，所有的路由器，以及与降低网络传输性能有关的所有因素。相反，流量控制往往是点对点通信量的控制，是个端到端的问题。流量控制所要做到的就是抑制发送端发送数据的速率，以便使接收端来得及接收。

![TCP的拥塞控制](https://oss.javaguide.cn/github/javaguide/cs-basics/network/tcp-congestion-control.png)

为了进行拥塞控制，TCP 发送方要维持一个 **拥塞窗口(cwnd)** 的状态变量。拥塞控制窗口的大小取决于网络的拥塞程度，并且动态变化。发送方让自己的发送窗口取为拥塞窗口和接收方的接受窗口中较小的一个。

TCP 的拥塞控制采用了四种算法，即 **慢开始**、 **拥塞避免**、**快重传** 和 **快恢复**。在网络层也可以使路由器采用适当的分组丢弃策略（如主动队列管理 AQM），以减少网络拥塞的发生。

- **慢开始：** 慢开始算法的思路是当主机开始发送数据时，如果立即把大量数据字节注入到网络，那么可能会引起网络阻塞，因为现在还不知道网络的符合情况。经验表明，较好的方法是先探测一下，即由小到大逐渐增大发送窗口，也就是由小到大逐渐增大拥塞窗口数值。cwnd 初始值为 1，每经过一个传播轮次，cwnd 加倍。
- **拥塞避免：** 拥塞避免算法的思路是让拥塞窗口 cwnd 缓慢增大，即每经过一个往返时间 RTT 就把发送方的 cwnd 加 1.
- **快重传与快恢复：** 在 TCP/IP 中，快速重传和恢复（fast retransmit and recovery，FRR）是一种拥塞控制算法，它能快速恢复丢失的数据包。没有 FRR，如果数据包丢失了，TCP 将会使用定时器来要求传输暂停。在暂停的这段时间内，没有新的或复制的数据包被发送。有了 FRR，如果接收机接收到一个不按顺序的数据段，它会立即给发送机发送一个重复确认。如果发送机接收到三个重复确认，它会假定确认件指出的数据段丢失了，并立即重传这些丢失的数据段。有了 FRR，就不会因为重传时要求的暂停被耽误。 　当有单独的数据包丢失时，快速重传和恢复（FRR）能最有效地工作。当有多个数据信息包在某一段很短的时间内丢失时，它则不能很有效地工作。

## ARQ 协议了解吗?

**自动重传请求**（Automatic Repeat-reQuest，ARQ）是 OSI 模型中数据链路层和传输层的错误纠正协议之一。它通过使用确认和超时这两个机制，在不可靠服务的基础上实现可靠的信息传输。如果发送方在发送后一段时间之内没有收到确认信息（Acknowledgements，就是我们常说的 ACK），它通常会重新发送，直到收到确认或者重试超过一定的次数。

ARQ 包括停止等待 ARQ 协议和连续 ARQ 协议。

### 停止等待 ARQ 协议

The stop-and-wait protocol is to achieve reliable transmission. Its basic principle is to stop sending every time a packet is sent and wait for the other party to confirm (reply ACK). If after a period of time (after the timeout period), the ACK confirmation is still not received, it means that the transmission was not successful and needs to be resent until the confirmation is received before sending the next packet;

In the stop-and-wait protocol, if the receiver receives a duplicate packet, it discards the packet, but also sends an acknowledgment at the same time.

**1) No error situation:**

The sender sends the packet, the receiver receives it within the specified time, and replies with confirmation. The sender sends again.

**2) Error occurs (timeout retransmission):**

Timeout retransmission in the stop-and-wait protocol means that as long as no confirmation is received after a period of time, the previously sent packet will be retransmitted (the packet just sent is considered to be lost). Therefore, a timeout timer needs to be set after each packet is sent, and its retransmission time should be longer than the average round-trip time of data in packet transmission. This automatic retransmission method is often called **Automatic Repeat Request ARQ**. In addition, in the stop-and-wait protocol, if a duplicate packet is received, the packet is discarded, but an acknowledgment is also sent at the same time.

**3) Confirmation lost and confirmation late**

- **Confirmation Lost**: The confirmation message is lost during transmission. When A sends an M1 message and B receives it, B sends an M1 confirmation message to A, but it is lost during transmission. However, A does not know that after the timeout, A retransmits the M1 message, and B takes the following two measures after receiving the message again: 1. Discard the duplicate M1 message and do not deliver it to the upper layer. 2. Send a confirmation message to A. (It will not be considered that it has been sent, so it will not be sent again. If A can retransmit, it proves that B's confirmation message is lost).
- **ACKLATE**: The acknowledgment message was late during transmission. A sends M1 message, B receives and sends confirmation. If no acknowledgment message is received within the timeout period, A retransmits the M1 message, and B still receives and continues to send the acknowledgment message (B received 2 copies of M1). At this time, A receives the confirmation message sent by B for the second time. Then send other data. After a while, A received the first confirmation message for M1 sent by B (A also received 2 confirmation messages). The processing is as follows: 1. After A receives the duplicate confirmation, it discards it directly. 2. After B receives the duplicate M1, it also discards the duplicate M1 directly.

### Continuous ARQ protocol

The continuous ARQ protocol improves channel utilization. The sender maintains a sending window, and packets within the sending window can be sent continuously without waiting for confirmation from the other party. The receiver generally uses cumulative acknowledgment and sends an acknowledgment to the last packet that arrives in sequence, indicating that all packets up to this packet have been received correctly.

- **Advantages:** The channel utilization rate is high and easy to implement. Even if the confirmation is lost, there is no need to retransmit.
- **Disadvantage:** It cannot reflect to the sender the information of all packets that the receiver has correctly received. For example: the sender sends 5 messages, and the third one is lost (No. 3). At this time, the receiver can only send confirmations to the first two. The sender has no way of knowing the whereabouts of the last three packets, and has to retransmit them all once. This is also called Go-Back-N, which means that you need to go back and retransmit the N messages that have been sent.

## How to implement timeout retransmission? How to determine the timeout and retransmission time?

After the sender sends the data, it starts a timer and waits for the destination to confirm receipt of the segment. The receiving entity sends back a corresponding acknowledgment message (ACK) for the successfully received packet. If the sending entity does not receive the acknowledgment message within a reasonable round-trip delay (RTT), the corresponding data packet is assumed to be [lost](https://zh.wikipedia.org/wiki/PacketLost) and retransmitted.

- RTT (Round Trip Time): round trip time, that is, the time from when a data packet is sent to when the corresponding ACK is received.
- RTO (Retransmission Time Out): Retransmission timeout, which is calculated from the time when the data is sent. Retransmission will be performed after this time.

The determination of RTO is a key issue because it directly affects the performance and efficiency of TCP. If the RTO is set too small, it will cause unnecessary retransmissions and increase network burden; if the RTO is set too large, it will cause delays in data transmission and reduce throughput. Therefore, RTO should be dynamically adjusted based on the actual network conditions.

The value of RTT will change with network fluctuations, so TCP cannot directly use RTT as RTO. In order to dynamically adjust RTO, the TCP protocol uses some algorithms, such as the weighted moving average (EWMA) algorithm, Karn algorithm, Jacobson algorithm, etc. These algorithms all estimate the value of RTO based on the measurement and changes of the round-trip delay (RTT).

## Reference

1. "Computer Networks (7th Edition)"
2. "HTTP Illustrated"
3. [https://www.9tut.com/tcp-and-udp-tutorial](https://www.9tut.com/tcp-and-udp-tutorial)
4. [https://github.com/wolverinn/Waking-Up/blob/master/Computer%20Network.md](https://github.com/wolverinn/Waking-Up/blob/master/Computer%20Network.md)
5. TCP Flow Control—[https://www.brianstorti.com/tcp-flow-control/](https://www.brianstorti.com/tcp-flow-control/)
6. TCP flow control: <https://notfalse.net/24/tcp-flow-control>
7. TCP sliding window principle: <https://cloud.tencent.com/developer/article/1857363>

<!-- @include: @article-footer.snippet.md -->