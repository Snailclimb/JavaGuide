由于内容比较多，我下面放的是我更新在我的微信公众号上的链接，微信排版比较好看，更加利于阅读。每一篇文章下面我都把文章的主要内容给列出来了，便于大家学习与回顾。

### [Java NIO 概览](https://mp.weixin.qq.com/s?__biz=MzU4NDQ4MzU5OA==&mid=2247483956&idx=1&sn=57692bc5b7c2c6dfb812489baadc29c9&chksm=fd985455caefdd4331d828d8e89b22f19b304aa87d6da73c5d8c66fcef16e4c0b448b1a6f791#rd)

### 主要内容:
1.  **NIO简介**:

    Java NIO 是 java 1.4, 之后新出的一套IO接口NIO中的N可以理解为Non-blocking，不单纯是New。

2.  **NIO的特性/NIO与IO区别:**
    -   1)IO是面向流的，NIO是面向缓冲区的；
    -   2)IO流是阻塞的，NIO流是不阻塞的;
    -   3)NIO有选择器，而IO没有。
3.  **读数据和写数据方式:**
    - 从通道进行数据读取 ：创建一个缓冲区，然后请求通道读取数据。

    - 从通道进行数据写入 ：创建一个缓冲区，填充数据，并要求通道写入数据。

4.  **NIO核心组件简单介绍**
    - **Channels**
    - **Buffers**
    - **Selectors**


### [Java NIO 之 Buffer(缓冲区)](https://mp.weixin.qq.com/s?__biz=MzU4NDQ4MzU5OA==&mid=2247483961&idx=1&sn=f67bef4c279e78043ff649b6b03fdcbc&chksm=fd985458caefdd4e3317ccbdb2d0a5a70a5024d3255eebf38183919ed9c25ade536017c0a6ba#rd)

### 主要内容:
1. **Buffer(缓冲区)介绍:**
   - Java NIO Buffers用于和NIO Channel交互。 我们从Channel中读取数据到buffers里，从Buffer把数据写入到Channels；
   - Buffer本质上就是一块内存区；
   - 一个Buffer有三个属性是必须掌握的，分别是：capacity容量、position位置、limit限制。
2. **Buffer的常见方法**
    - Buffer clear()
    - Buffer flip()
    - Buffer rewind()
    - Buffer position(int newPosition)
3. **Buffer的使用方式/方法介绍:**
    - 分配缓冲区（Allocating a Buffer）:
    ```java
    ByteBuffer buf = ByteBuffer.allocate(28);//以ByteBuffer为例子
    ```
    - 写入数据到缓冲区（Writing Data to a Buffer）
    
     **写数据到Buffer有两种方法：**
      
      1.从Channel中写数据到Buffer
      ```java
      int bytesRead = inChannel.read(buf); //read into buffer.
      ```
      2.通过put写数据：
      ```java
      buf.put(127);
      ```

4. **Buffer常用方法测试**
     
    说实话，NIO编程真的难，通过后面这个测试例子，你可能才能勉强理解前面说的Buffer方法的作用。


### [Java NIO 之 Channel（通道）](https://mp.weixin.qq.com/s?__biz=MzU4NDQ4MzU5OA==&mid=2247483966&idx=1&sn=d5cf18c69f5f9ec2aff149270422731f&chksm=fd98545fcaefdd49296e2c78000ce5da277435b90ba3c03b92b7cf54c6ccc71d61d13efbce63#rd)
1.  **Channel（通道）介绍**
     - 通常来说NIO中的所有IO都是从 Channel（通道） 开始的。 
     - NIO Channel通道和流的区别：
2. **FileChannel的使用**
3. **SocketChannel和ServerSocketChannel的使用**
4.  **️DatagramChannel的使用**
5.  **Scatter / Gather**
    - Scatter: 从一个Channel读取的信息分散到N个缓冲区中(Buufer).
    - Gather: 将N个Buffer里面内容按照顺序发送到一个Channel.
6. **通道之间的数据传输**
   - 在Java NIO中如果一个channel是FileChannel类型的，那么他可以直接把数据传输到另一个channel。
   - transferFrom() :transferFrom方法把数据从通道源传输到FileChannel
   - transferTo() :transferTo方法把FileChannel数据传输到另一个channel
