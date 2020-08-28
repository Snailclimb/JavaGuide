# Netty

**本文章总结了 《Netty in Action》(Netty实战) 和 《Netty 4.x User Guide 》(Netty 4.x 用户指南)，
再根据本人实际学习体验总结而成。本部分内容可能不那么全面，但是我尽量挑选Netty中我认为比较重要的部分做讲解。**

学习Netty，相信大部分同学都会选择 《Netty in Action》 和  《Netty 4.x User Guide 》，
这里我推荐它们的通读版本，这二本书的通读版本的作者都为同一人，通读版本对《Netty in Action》做出了更为精简的概述，
所以各位同学可酌情挑选阅读。

- [《Netty in Action》](https://waylau.com/essential-netty-in-action/index.html)

- [《Netty 4.x User Guide》](https://waylau.gitbooks.io/netty-4-user-guide/content)

其次我认为只看书是不够的，这里我推荐一些关于Netty入门比较优秀的视频供各位同学参考，
推荐视频观看的顺序即下列顺序，各位同学不需要每个视频的每个章节都看，只需要挑选互补的内容学习即可：

- [韩顺平Netty教程](https://www.bilibili.com/video/BV1DJ411m7NR)

- [张龙Netty教程](https://www.bilibili.com/video/BV1cb411F7En)

- [索南杰夕Netty RPC实现](https://www.bilibili.com/video/BV1Rb411h7jZ)


最后，在学习Netty之前，我们需要对 IO模型(网络IO模型)有一个大概的认知，可以参考我编写的：
[Linux IO模型](../java/Linux_IO模型.md) 。


````text
如有错误之处，敬请指教。
````


## Netty是什么?

Netty是Red Hat开源的，一个利用Java的高级网络能力，隐藏其(Java API)背后的复杂性而提供一个易于使用的 NIO 客户端/服务端框架。
Netty提供了高性能和可扩展性，让你自由地专注于你真正感兴趣的东西。 Netty简化了网络程序的开发过程，使用它
我们可以快速简单地开发网络应用程序，比如客户端和服务端的通信协议，TCP和UDP的Socket开发。


### Netty的特点
Netty作为一款优秀的网络框架，自然有令人折服的特点：

- 设计：
  
  - 针对多种传输类型的同一接口。
  
  - 简单但更强大的线程模型。
  
  - 真正的无连接的数据报套接字支持。
  
  - 链接逻辑复用。
  
- 性能： Netty的高性能是它被广泛使用的一个重要的原因，我们可能都认为Java不太适合
编写游戏服务端程序，但Netty的到来无疑是降低了怀疑的声音。

  - 较原生Java API有更好的吞吐量，较低的延时。
  
  - 资源消耗更少(共享池和重用)。
  
  - 减少内存拷贝。
  
- 健壮性： 原生NIO的客户端/服务端程序编写较为麻烦，如果某个地方处理的不好，可能会
  导致一些意料之外的异常，如内存溢出，死循环等等，而Netty则为我们简化了原生API
  的使用，这使得我们编写出来的程序不那么容易出错。
  
- 社区： Netty快速发展的一个重要的原因就是它的社区非常活跃，这也使得采用它的开发者越来越多。


## Netty架构总览
下面是Netty的模块设计部分：

![Netty架构总览](../../media/pictures/netty/Netty架构总览.png)

Netty提供了通用的传输API（TCP/UDP...）；多种网络协议（HTTP/WebSocket...）；基于事件驱动的IO模型；
超高性能的零拷贝...

上面说的这些模块和功能只是Netty的一部分，具体的组件在后面的部分会有较为详细的介绍。