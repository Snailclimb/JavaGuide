---
title: TCP 三次握手和四次挥手（传输层）
category: 计算机基础
tag:
  - 计算机网络
head:
  - - meta
    - name: keywords
      content: TCP,三次握手,四次挥手,状态机,SYN,ACK,FIN,半连接队列,全连接队列
  - - meta
    - name: description
      content: 详解 TCP 建连与断连过程，结合状态迁移与队列机制解析可靠通信保障与高并发连接处理。
---

TCP 是一种面向连接的、可靠的传输层协议。为了在两个不可靠的端点之间建立一个可靠的连接，TCP 采用了三次握手（Three-way Handshake）的策略。

## 建立连接-TCP 三次握手

![TCP 三次握手图解](https://oss.javaguide.cn/github/javaguide/cs-basics/network/tcp-shakes-hands-three-times.png)

建立一个 TCP 连接需要“三次握手”，缺一不可：

1. **第一次握手 (SYN)**: 客户端向服务端发送一个 SYN（Synchronize Sequence Numbers）报文段，其中包含一个由客户端随机生成的初始序列号（Initial Sequence Number, ISN），例如 seq=x。发送后，客户端进入 **SYN_SEND** 状态，等待服务端的确认。
2. **第二次握手 (SYN+ACK)**: 服务端收到 SYN 报文段后，如果同意建立连接，会向客户端回复一个确认报文段。该报文段包含两个关键信息：
   - **SYN**：服务端也需要同步自己的初始序列号，因此报文段中也包含一个由服务端随机生成的初始序列号，例如 seq=y。
   - **ACK** (Acknowledgement)：用于确认收到了客户端的请求。其确认号被设置为客户端初始序列号加一，即 ack=x+1。
   - 发送该报文段后，服务端进入 **SYN_RECV** 状态。
3. **第三次握手 (ACK)**: 客户端收到服务端的 SYN+ACK 报文段后，会向服务端发送一个最终的确认报文段。该报文段包含确认号 ack=y+1。发送后，客户端进入 **ESTABLISHED** 状态。服务端收到这个 ACK 报文段后，也进入 **ESTABLISHED** 状态。

至此，双方都确认了连接的建立，TCP 连接成功创建，可以开始进行双向数据传输。

### 什么是半连接队列和全连接队列？

在 TCP 三次握手过程中，服务端内核会使用两个队列来管理连接请求：

1. **半连接队列**（也称 SYN Queue）：当服务端收到客户端的 SYN 请求并回复 SYN+ACK 后，连接会处于 SYN_RECV 状态。此时，这个连接信息会被放入半连接队列。这个队列存储的是尚未完成三次握手的连接。
2. **全连接队列**（也称 Accept Queue）：当服务端收到客户端对 ACK 响应时，意味着三次握手成功完成，服务端会将该连接从半连接队列移动到全连接队列。如果未收到客户端的 ACK 响应，会进行重传，重传的等待时间通常是指数增长的。如果重传次数超过系统规定的最大重传次数，系统将从半连接队列中删除该连接信息。

这两个队列的存在是为了处理并发连接请求，确保服务端能够有效地管理新的连接请求。

如果全连接队列满了，新的已完成握手的连接可能会被丢弃，或者触发其他策略。这两个队列的大小都受系统参数控制，它们的容量限制是影响服务器处理高并发连接能力的重要因素，也是 SYN 泛洪攻击（SYN Flood）所针对的目标。

### 为什么要三次握手?

TCP 三次握手的核心目的是为了在客户端和服务器之间建立一个**可靠的**、**全双工的**通信信道。这需要实现两个主要目标：

**1. 确认双方的收发能力，并同步初始序列号 (ISN)**

TCP 通信依赖序列号来保证数据的有序和可靠。三次握手是双方交换和确认彼此初始序列号（ISN）的过程，通过这个过程，双方也间接验证了各自的收发能力。

- **第一次握手 (客户端 → 服务器)** ：客户端发送 SYN 包。
  - 服务器：能确认客户端的发送能力正常，自己的接收能力正常。
  - 客户端：无法确认任何事。
- **第二次握手 (服务器 → 客户端)** ：服务器回复 SYN+ACK 包。
  - 客户端：能确认自己的发送和接收能力正常，服务器的接收和发送能力正常。
  - 服务端：能确认对方发送能力正常，自己接收能力正常
- **第三次握手 (客户端 → 服务器)** ：客户端发送 ACK 包。
  - 客户端：能确认双方发送和接收能力正常。
  - 服务端：能确认双方发送和接收能力正常。

经过这三次交互，双方都确认了彼此的收发功能完好，并完成了初始序列号的同步，为后续可靠的数据传输奠定了基础。

**2. 防止已失效的连接请求被错误地建立**

这是“为什么不能是两次握手”的关键原因。

设想一个场景：客户端发送的第一个连接请求（SYN1）因网络延迟而滞留，于是客户端重发了第二个请求（SYN2）并成功建立了连接，数据传输完毕后连接被释放。此时，延迟的 SYN1 才到达服务端。

- **如果是两次握手**：服务端收到这个失效的 SYN1 后，会误认为是一个新的连接请求，并立即分配资源、建立连接。但这将导致服务端单方面维持一个无效连接，白白浪费系统资源，因为客户端并不会有任何响应。
- **有了第三次握手**：服务端收到失效的 SYN1 并回复 SYN+ACK 后，会等待客户端的最终确认（ACK）。由于客户端当前并没有发起连接的意图，它会忽略这个 SYN+ACK 或者发送一个 RST (Reset) 报文。这样，服务端就无法收到第三次握手的 ACK，最终会超时关闭这个错误的连接，从而避免了资源浪费。

因此，三次握手是确保 TCP 连接可靠性的**最小且必需**的步骤。它不仅确认了双方的通信能力，更重要的是增加了一个最终确认环节，以防止网络中延迟、重复的历史请求对连接建立造成干扰。

### 第 2 次握手传回了 ACK，为什么还要传回 SYN？

服务端传回发送端所发送的 ACK 是为了告诉客户端：“我接收到的信息确实就是你所发送的信号了”，这表明从客户端到服务端的通信是正常的。回传 SYN 则是为了建立并确认从服务端到客户端的通信。

> SYN 同步序列编号(Synchronize Sequence Numbers) 是 TCP/IP 建立连接时使用的握手信号。在客户机和服务端之间建立正常的 TCP 网络连接时，客户机首先发出一个 SYN 消息，服务端使用 SYN-ACK 应答表示接收到了这个消息，最后客户机再以 ACK(Acknowledgement）消息响应。这样在客户机和服务端之间才能建立起可靠的 TCP 连接，数据才可以在客户机和服务端之间传递。

### 三次握手过程中可以携带数据吗？

在 TCP 三次握手过程中，第三次握手是可以携带数据的(客户端发送完 ACK 确认包之后就进入 ESTABLISHED 状态了)，这一点在 RFC 793 文档中有提到。也就是说，一旦完成了前两次握手，TCP 协议允许数据在第三次握手时开始传输。

如果第三次握手的 ACK 确认包丢失，但是客户端已经开始发送携带数据的包，那么服务端在收到这个携带数据的包时，如果该包中包含了 ACK 标记，服务端会将其视为有效的第三次握手确认。这样，连接就被认为是建立的，服务端会处理该数据包，并继续正常的数据传输流程。

## 断开连接-TCP 四次挥手

![TCP 四次挥手图解](https://oss.javaguide.cn/github/javaguide/cs-basics/network/tcp-waves-four-times.png)

断开一个 TCP 连接则需要“四次挥手”，缺一不可：

1. **第一次挥手 (FIN)**:当客户端（或任何一方）决定关闭连接时，它会向服务端发送一个 **FIN**（Finish）标志的报文段，表示自己已经没有数据要发送了。该报文段包含一个序列号 seq=u。发送后，客户端进入 **FIN-WAIT-1** 状态。
2. **第二次挥手 (ACK)**:服务端收到 FIN 报文段后，会立即回复一个 **ACK** 确认报文段。其确认号为 ack=u+1。发送后，服务端进入 **CLOSE-WAIT** 状态。客户端收到这个 ACK 后，进入 **FIN-WAIT-2** 状态。此时，TCP 连接处于**半关闭（Half-Close）**状态：客户端到服务端的发送通道已关闭，但服务端到客户端的发送通道仍然可以传输数据。
3. **第三次挥手 (FIN)**:当服务端确认所有待发送的数据都已发送完毕后，它也会向客户端发送一个 **FIN** 报文段，表示自己也准备关闭连接。该报文段同样包含一个序列号 seq=y。发送后，服务端进入 **LAST-ACK** 状态，等待客户端的最终确认。
4. **The fourth wave**: After receiving the FIN message segment from the server, the client will reply with a final **ACK** confirmation message segment, the confirmation number is ack=y+1. After sending, the client enters the **TIME-WAIT** state. After receiving this ACK, the server immediately enters the **CLOSED** state to complete the connection closure. The client will wait for **2MSL** (Maximum Segment Lifetime, the maximum survival time of the message segment) in the **TIME-WAIT** state before finally entering the **CLOSED** state.

**As long as the four waves are not over, the client and server can continue to transmit data! **

### Why wave four times?

TCP is full-duplex communication and can transmit data in both directions. Either party can issue a connection release notification after the data transmission is completed, and enter a semi-closed state after the other party confirms. When the other party has no more data to send, a connection release notification is issued. After the other party confirms, the TCP connection is completely closed.

For example: A and B are on the phone and the call is about to end.

1. **First wave**: A said "I have nothing more to say"
2. **Second wave**: B answers "I understand", but B may have something else to say, and A cannot ask B to end the call at his own pace.
3. **Waving for the third time**: Then B may have talked for a while, and finally B said "I'm done"
4. **The fourth wave**: Person A answers "I know", and the call ends.

### Why can't the ACK and FIN sent by the server be combined into three waves?

Because when the server receives the client's request to disconnect, there may still be some data that has not been sent. At this time, it responds with ACK first, indicating that it has received the disconnect request. Wait until the data is sent before sending FIN to disconnect the data transmission from the server to the client.

### What will happen if the ACK from the server is not delivered to the client when waving for the second time?

The client starts a retransmission timer after sending the FIN. If no ACK from the server is received before the timer expires, the client will consider the FIN message lost and resend the FIN message.

### Why does the client need to wait for 2\*MSL (maximum segment life) time before entering the CLOSED state after the fourth wave?

When waving for the fourth time, the ACK sent by the client to the server may be lost. If the server does not receive the ACK for some reason, the server will resend the FIN. If the client receives the FIN within 2\*MSL, it will resend the ACK and wait for 2MSL again to prevent the server from continuously resending FIN without receiving the ACK.

> **MSL (Maximum Segment Lifetime)**: The maximum survival time of a segment in the network. 2MSL is the maximum time required for a send and a reply. If the Client does not receive the FIN again until 2MSL, the Client concludes that the ACK has been successfully received and ends the TCP connection.

## Reference

- "Computer Networks (7th Edition)"

- "HTTP Illustrated"

- TCP and UDP Tutorial: <https://www.9tut.com/tcp-and-udp-tutorial>

- Starting from an online problem, a detailed explanation of TCP semi-connection queue and full connection queue: <https://mp.weixin.qq.com/s/YpSlU1yaowTs-pF6R43hMw>

<!-- @include: @article-footer.snippet.md -->