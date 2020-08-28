# Netty特性

## 强大的数据容器
Netty使用自建的Buffer API实现ByteBuf，而不是使用JDK NIO的ByteBuffer来表示一个连续的字节序列。与JDK NIO的
ByteBuffer相比，Netty的ByteBuf有更加明显的优势，这些优势可以弥补Java原生ByteBuffer的底层缺点，并提供
更加方便的编程模型：

- 正常情况下，ByteBuf比ByteBuffer的性能更好；

- 实现了ReferenceCounted引用计数接口，优化了内存的使用；

- 容量可以动态增长，如StringBuilder之于String；

- 在读和写这两种模式切换时，无需像ByteBuffer一样调用flip方法，更易于操作；

...


### ByteBuf的自动容量扩展
在JDK NIO中，一旦ByteBuffer被分配了内存就不能再改变大小，这可能会带来很多不便。 
我们在创建字符串时可能不确定字符串的长度，这种情况下如果使用String可能会有多次拼接的消耗，
所以这就是StringBuilder的作用，同样的，ByteBuf也是如此。

````text
// 一种   新的动态缓冲区被创建。在内部，实际缓冲区是被“懒”创建，从而避免潜在的浪费内存空间。
ByteBuf b = Unpooled.buffer(4);

// 当第一个执行写尝试，内部指定初始容量 4 的缓冲区被创建
b.writeByte('1');

b.writeByte('2');
b.writeByte('3');
b.writeByte('4');

// 当写入的字节数超过初始容量 4 时，
//内部缓冲区自动分配具有较大的容量
b.writeByte('5');
````

## 通用的传输API
传统的Java IO在应对不同的传输协议的时候需要使用不同的API，比如java.net.Socket和java.net.DatagramSocket。
它们分别是TCP和UDP的传输API，因此在使用它们的时候我们就需要学习不同的编程方式。这种编程模式会使得在维护
或修改其对应的程序的时候变得繁琐和困难，简单来说就是降低了代码的可维护性。

这种情况还发生在Java的NIO和AIO上，由于所有的IO API无论是性能还是设计上都有所不同，所以注定这些API之间是不兼容的，
因此我们不得不在编写程序之前先选好要使用的IO API。

在Netty中，有一个通用的传输API，也是一个IO编程接口： Channel，这个API抽象了所有的IO模型，如果你的应用
已经使用了Netty的某一种传输实现，那么你的无需付出太多代价就能换成另一种传输实现。

Netty提供了非常多的传输实现，如nio，oio，epoll，kqueue等等，通常切换不同的传输实现只需要对几行代码进行
修改就行了，例如选择一个不同的 [ChannnelFactory](http://netty.io/4.0/api/io/netty/bootstrap/ChannelFactory.html)，
这也是面向接口编程的一大好处。


## 基于拦截链模式的事件模型
Netty具有良好的IO事件模型，它允许我们在不破坏原有代码结构的情况下实现自己的事件类型。 很多IO框架
没有事件模型或者在这方面做的不够好，这也是Netty的优秀设计的体现之一。
关于事件模型可以看我编写的： [ChannelHandler](https://github.com/guang19/framework-learning/blob/dev/netty-learning/Netty%E7%BB%84%E4%BB%B6.md#ChannelHandler)