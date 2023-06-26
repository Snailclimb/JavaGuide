在学习 `NIO` 之前，需要先了解一下计算机 `I/O`模型的基础理论知识。还不了解的话，可以参考这篇文章：[Java IO 模型详解](https://javaguide.cn/java/io/io-model.html)。

## `NIO` 简介

在传统的 `Java I/O` 模型（`BIO`）中，`I/O` 操作是以阻塞的方式进行的。也就是说，当一个线程执行一个 `I/O` 操作时，它会被阻塞直到操作完成。这种阻塞模型在处理多个并发连接时可能会导致性能瓶颈。

为了解决这个问题，在` Java `1.4 版本引入了一种新的` I/O` 模型 —— `Java NIO` （`New IO`，也称为 `Non-blocking IO`） 。`Java NIO` 弥补了原来同步阻塞`I/O`的不足，它在标准 `Java` 代码中提供了高速的、面向块的 `I/O`。定义包含数据的类，并通过以块的形式处理这些数据。`NIO` 包含三个核心的组件：`Buffer`（缓冲区）、`Channel`（通道）、`Selector`（多路复用器）。

![图片来着《面试官：Java NIO 了解？》](.\images\NIO\640.jpg)

在开始介绍 `NIO` 的核心组件之前，可以先回顾一下`I/O` 模型中的同步非阻塞 `I/O` （`Non-blocking IO`）和 `I/O` 多路复用。读完文章之后，思考下对应 `Java NIO` 属于哪一种 `I/O` 模型？

## `NIO` 核心组件

`Java NIO` 主要包括以下三个核心组件：`Buffer`（缓冲区）、`Channel`（通道）和 `Selector`（选择器）。下面分别介绍这三个组件。

### `Buffer`（缓冲区）

在传统的 `BIO` 中，数据的读写是面向流的，通过各种输入/输出 `Stream` 对象实现数据的读写。`BIO` 中有一个庞大的 "`stream` 家族" 应用于各种场景的数据读写：

![BIO "stream 家族"](.\images\NIO\image-20230618202236755.png)



在`Java` 1.4 的 `NIO` 库中，所有数据都是用缓冲区处理的，这是新库和之前的 `BIO` 的一个重要区别。与 `BIO` 流式处理的 `Stream` 家族相对应，新库引入了 `Buffer` 对象。见名思义：`Buffer` 是一个缓存区，在读取数据时，它是直接读到缓冲区中的。在写入数据时，写入到缓冲区中。 使用 `NIO` 在读写数据时，都是通过缓冲区进行操作。



◼ Buffer是抽象类，它有如下子类：
`ByteBuffer` 、`CharBuffer` 、`ShortBuffer` 、`IntBuffer`、`LongBuffer` 、`FloatBuffer` 、`DoubleBuffer` ；通过名称就可以看出来，这些子类用来存储对应类型的数据。



![NIO ”Buffer 家族“](.\images\NIO\image-20230620235630296.png)

◼ `Buffer` 中的四个成员变量：

~~~java
public abstract class Buffer {
    // Invariants: mark <= position <= limit <= capacity
    private int mark = -1;
    private int position = 0;
    private int limit;
    private int capacity;
}
~~~

1. 容量（`capacity`）：`Buffer`可以存储的最大数据量，该值不可改变；
2. 界限（`limit`）：`Buffer` 中可以读/写数据的边界，`limit` 之后的数据不能访问；
3. 位置（`position`）：下一个可以被读写的数据的位置（索引）；
4. 标记（`mark`）：`Buffer`允许将位置直接定位到该标记处，这是一个可选属性；

并且，上述变量满足如下的关系：0 <= mark <= position <= limit <= capacity 。

![Buffer 成员变量关系](.\images\image-20230615221211005.png)

◼  `Buffer` 对象不能通过 `new` 调用构造方法创建对象 ，只能通过静态方法实例化 `Buffer`。下面是 `ByteBuffer `类中创建示例提供的静态方法：

~~~java
public static ByteBuffer allocate(int capacity); // 分配堆内存
public static ByteBuffer allocateDirect(int capacity); // 分配直接内存
~~~

◼ `Buffer` 最核心的两个方法：

1. `get` : 读取缓冲区的数据
2. `put` ：向缓冲区写入数据

除上述两个方法之外，其他的重要方法：

- `flip` ：将缓冲区从写模式切换到读模式，它会将 `limit` 的值设置为当前 `position` 的值，将 `position` 的值设置为 0。
- `clear`:  清空缓冲区，将缓冲区从读模式切换到写模式，并将 `position` 的值设置为 0，将 `limit` 的值设置为 `capacity` 的值。

Buffer中数据变化的过程：

~~~java
import java.nio.*;

public class CharBufferDemo {
    public static void main(String[] args) {
        // 分配一个容量为8的CharBuffer
        CharBuffer buffer = CharBuffer.allocate(8);
        System.out.println("初始状态："); 
        printState(buffer); 

        // 向buffer写入3个字符
        buffer.put('a').put('b').put('c');
        System.out.println("写入3个字符后的状态：");
        printState(buffer);

        // 调用flip()方法，准备读取buffer中的数据，将 position 置 0,limit 的置 3
        buffer.flip();
        System.out.println("调用flip()方法后的状态：");
        printState(buffer);

        // 读取字符
        while (buffer.hasRemaining()) { 
            System.out.print(buffer.get());
        }

        // 调用clear()方法，清空缓冲区，将 position 的值置为 0，将 limit 的值置为 capacity 的值
        buffer.clear();
        System.out.println("调用clear()方法后的状态：");
        printState(buffer);

    }

    // 打印buffer的capacity、limit、position、mark的位置
    private static void printState(CharBuffer buffer) {
        System.out.print("capacity: " + buffer.capacity());
        System.out.print(", limit: " + buffer.limit());
        System.out.print(", position: " + buffer.position());
        System.out.print(", mark 开始读取的字符: " + buffer.mark());
        System.out.println("\n");
    }
}
~~~

打印结果：

~~~tex
初始状态：
capacity: 8, limit: 8, position: 0, mark 开始读取的字符:（8个空字符）        
~~~

![初始状态](.\images\NIO\image-20230618215703502.png)

~~~tex
写入3个字符后的状态：
capacity: 8, limit: 8, position: 3, mark 开始读取的字符:（5个空字符）   
~~~

![写入3个字符后的状态](.\images\NIO\image-20230618215834167.png)

~~~tex
调用flip()方法后的状态：
capacity: 8, limit: 3, position: 0, mark 开始读取的字符: abc
~~~

![调用flip方法后的状态](.\images\NIO\image-20230618220051437.png)



~~~tex
调用clear()方法后的状态：
capacity: 8, limit: 8, position: 0, mark 开始读取的字符: abc（5个空字符）     
~~~



![调用clear方法后的状态](.\images\NIO\image-20230618220217580.png)





### `Channel`（通道）

`Channel` 是一个通道，它代表着与数据源（如文件、网络套接字等）之间的连接。可以通过它读取和写入数据，它就像自来水管一样，网络数据通过 `Channel` 读取和写入。

`BIO` 中的 `Stream` 是单向的，分为各种 `InputStream`（输入流）和 `OutputStream`（输出流），数据只是在一个方向上传输。 `Channel`（通道）与流的不同之处在于`Channel`是双向的，它可以用于读、写或者同时用于读写。

因为 `Channel` 是全双工的，所以它可以比流更好地映射底层操作系统的 `API` 。特别是在 `UNIX` 网络编程模型中，底层操作系统的通道都是全双工的，同时支持读写操作。



在 `Java NIO` 中，主要有以下几种类型的通道：

◼ Channel的实现类：

1. `FileChannel`：文件访问通道；
2. `SocketChannel`、`ServerSocketChannel`：`TCP`通信通道；
3. `DatagramChannel`：`UDP`通信通道；
4. `Pipe.SourceChannel`、`Pipe.SinkChannel`：线程通信通道。



![channel 类继承图](.\images\NIO\image-20230620115120520.png)



◼ `Channel` 的实例化：

1. 各个 `Channel` 类提供的 `open()` 方法；

- 打开文件的 `FileChannel`：

~~~java
FileChannel channel = FileChannel.open(filePath, StandardOpenOption.READ);
~~~

- 建立网络连接的 `ServerSocketChannel`：

~~~java
ServerSocketChannel serverChannel = ServerSocketChannel.open();	
~~~



2. `BIO` 的各种`Stream`提供了`getChannel()`方法，可以直接返回 `FileChannel`。

~~~java
FileInputStream inputStream = new FileInputStream("source.txt");
FileChannel inputChannel = inputStream.getChannel();
~~~




◼ `Channel` 的方法：

1. `map()`方法用于将 `Channel` 对应的数据映射成 `ByteBuffer`；
2. `read()` 方法有一系列重载的形式，用于从 `Buffer` 中读取数据；
3. `write()` 方法有一系列重载的形式，用于向 `Buffer` 中写入数据。



◼ 使用`Channel`复制数据的代码示例：

~~~java
import java.io.RandomAccessFile;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;

public class FileChannelExample {
    public static void main(String[] args) throws Exception {
        RandomAccessFile file = new RandomAccessFile("D:/source.txt", "rw");
        FileChannel channel = file.getChannel();
        ByteBuffer buffer = ByteBuffer.allocate(1024);

        // 从通道读取数据到 Buffer 中
        int bytesRead = channel.read(buffer);
        while (bytesRead != -1) {
            System.out.println("Read " + bytesRead + " bytes");
            buffer.flip();
            while (buffer.hasRemaining()) {
                System.out.print((char) buffer.get());
            }
            buffer.clear();
            bytesRead = channel.read(buffer);
        }

        String data = "Hello, FileChannel!";
        buffer.put(data.getBytes());
        buffer.flip();
        // 向文件中追加写入数据
        int bytesWrite = channel.write(buffer);
        System.out.println("\nwrite " + bytesWrite + " bytes");

        channel.close();
        file.close();
    }
}
~~~





### `Selector`（选择器）



`Selector`（选择器） 是 `Java NIO`中的一个关键组件，它允许一个线程处理多个 `Channel`。`Selector` 是基于事件驱动的 `I/O` 多路复用模型，主要运作原理是：通过 `Selector` 注册通道的事件，`Selector` 会不断地轮询注册在其上的 `Channel`。当事件发生时，比如：某个 `Channel` 上面有新的 TCP 连接接入、读和写事件，这个 Channel 就处于就绪状态，会被 Selector 轮询出来。`Selector` 会将相关的 `Channel` 加入到就绪集合中。通过 `SelectionKey` 可以获取就绪 `Channel` 的集合，然后对这些就绪的 `Channel` 进行响应的 `I/O` 操作。

![IO多路复用模型](.\images\NIO\image-20230621004820823.png)

一个多路复用器 `Selector` 可以同时轮询多个 `Channel`，由于 `JDK` 使用了 `epoll()` 代替传统的 `select` 实现，所以它并没有最大连接句柄 1024/2048 的限制。这也就意味着只需要一个线程负责 `Selector` 的轮询，就可以接入成千上万的客户端。



◼监听事件类型

`Selector` 可以监听以下四种事件类型：

1. `SelectionKey.OP_ACCEPT`：表示通道接受连接的事件，这通常用于 `ServerSocketChannel`。
2. `SelectionKey.OP_CONNECT`：表示通道完成连接的事件，这通常用于 `SocketChannel`。
3. `SelectionKey.OP_READ`：表示通道准备好进行读取的事件，即有数据可读。
4. `SelectionKey.OP_WRITE`：表示通道准备好进行写入的事件，即可以写入数据。



◼`SelectionKey` 集合

`Selector `是抽象类，可以通过调用此类的 `open()` 静态方法来创建 `Selector` 实例。`Selector` 可以同时监控多个 `SelectableChannel` 的 `IO` 状况，是非阻塞 `IO` 的核心。一个`Selector` 实例有三个 `SelectionKey` 集合：

1. 所有的 `SelectionKey` 集合：代表了注册在该 `Selector` 上的 `Channel`，这个集合可以通过 `keys()` 方法返回。
2. 被选择的 `SelectionKey` 集合：代表了所有可通过 `select()` 方法获取的、需要进行 `IO` 处理的 Channel，这个集合可以通过 `selectedKeys()` 返回。
3. 被取消的 `SelectionKey` 集合：代表了所有被取消注册关系的 `Channel`，在下一次执行 `select()` 方法时，这些 `Channel` 对应的 `SelectionKey` 会被彻底删除，程序通常无须直接访问该集合。



◼`select()` 相关的方法

`Selector` 还提供了一系列和 `select()` 相关的方法：

1. `int select()`：监控所有注册的 `Channel`，当它们中间有需要处理的 `IO` 操作时，该方法返回，并将对应的 `SelectionKey` 加入被选择的 `SelectionKey` 集合中，该方法返回这些 `Channel` 的数量。
2. `int select(long timeout)`：可以设置超时时长的 `select()` 操作。
3. `int selectNow()`：执行一个立即返回的 `select()`  操作，相对于无参数的 `select()` 方法而言，该方法不会阻塞线程。
4. `Selector wakeup()`：使一个还未返回的 `select()` 方法立刻返回。



◼使用 Selector 实现网络读写的简单示例：

~~~java
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.ServerSocketChannel;
import java.nio.channels.SocketChannel;
import java.util.Iterator;
import java.util.Set;

public class NioSelectorExample {

  public static void main(String[] args) {
    try {
      ServerSocketChannel serverSocketChannel = ServerSocketChannel.open();
      serverSocketChannel.configureBlocking(false);
      serverSocketChannel.socket().bind(new InetSocketAddress(8080));

      Selector selector = Selector.open();
      // 将 ServerSocketChannel 注册到 Selector 并监听 OP_ACCEPT 事件
      serverSocketChannel.register(selector, SelectionKey.OP_ACCEPT);

      while (true) {
        int readyChannels = selector.select();

        if (readyChannels == 0) {
          continue;
        }

        Set<SelectionKey> selectedKeys = selector.selectedKeys();
        Iterator<SelectionKey> keyIterator = selectedKeys.iterator();

        while (keyIterator.hasNext()) {
          SelectionKey key = keyIterator.next();

          if (key.isAcceptable()) {
            // 处理连接事件
            ServerSocketChannel server = (ServerSocketChannel) key.channel();
            SocketChannel client = server.accept();
            client.configureBlocking(false);

            // 将客户端通道注册到 Selector 并监听 OP_READ 事件
            client.register(selector, SelectionKey.OP_READ);
          } else if (key.isReadable()) {
            // 处理读事件
            SocketChannel client = (SocketChannel) key.channel();
            ByteBuffer buffer = ByteBuffer.allocate(1024);
            int bytesRead = client.read(buffer);

            if (bytesRead > 0) {
              buffer.flip();
              System.out.println("收到数据：" +new String(buffer.array(), 0, bytesRead));
              // 将客户端通道注册到 Selector 并监听 OP_WRITE 事件
              client.register(selector, SelectionKey.OP_WRITE);
            } else if (bytesRead < 0) {
              // 客户端断开连接
              client.close();
            }
          } else if (key.isWritable()) {
            // 处理写事件
            SocketChannel client = (SocketChannel) key.channel();
            ByteBuffer buffer = ByteBuffer.wrap("Hello, Client!".getBytes());
            client.write(buffer);

            // 将客户端通道注册到 Selector 并监听 OP_READ 事件
            client.register(selector, SelectionKey.OP_READ);
          }

          keyIterator.remove();
        }
      }
    } catch (IOException e) {
      e.printStackTrace();
    }
  }
}
~~~

在示例中，我们创建了一个简单的服务器，监听8080端口，使用 Selector 处理连接、读取和写入事件。当接收到客户端的数据时，服务器将读取数据并将其打印到控制台，然后向客户端回复 "Hello, Client!"。



## NIO 零拷贝

DirectBuffer是Java NIO库中提供的一种可以直接操作内存的缓冲区类型。

零拷贝是提升 IO 操作性能的一个常用手段，像 ActiveMQ、Kafka 、RocketMQ、QMQ、Netty 等顶级开源项目都用到了零拷贝。

零拷贝是指计算机执行 IO 操作时，CPU 不需要将数据从一个存储区域复制到另一个存储区域，从而可以减少上下文切换以及 CPU 的拷贝时间。也就是说，零拷贝主主要解决操作系统在处理 I/O 操作时频繁复制数据的问题。零拷贝的常见实现技术有： `mmap+write`、`sendfile`和 `sendfile + DMA gather copy` 。

下图展示了各种零拷贝技术的对比图：

|                            | CPU 拷贝 | DMA 拷贝 | 系统调用   | 上下文切换 |
| -------------------------- | -------- | -------- | ---------- | ---------- |
| 传统方法                   | 2        | 2        | read+write | 4          |
| mmap+write                 | 1        | 2        | mmap+write | 4          |
| sendfile                   | 1        | 2        | sendfile   | 2          |
| sendfile + DMA gather copy | 0        | 2        | sendfile   | 2          |

可以看出，无论是传统的 I/O 方式，还是引入了零拷贝之后，2 次 DMA(Direct Memory Access) 拷贝是都少不了的。因为两次 DMA 都是依赖硬件完成的。零拷贝主要是减少了 CPU 拷贝及上下文的切换。

Java 对零拷贝的支持：

- `MappedByteBuffer` 是 NIO 基于内存映射（mmap）这种零拷⻉⽅式的提供的⼀种实现，它的底层是调用了 Linux 内核的 `mmap` 。
- `FileChannel` 的`transferTo()/transferFrom()`调用了 Linux 内核的 `sendfile`。关于`FileChannel`的用法可以看看这篇文章：[Java NIO 文件通道 FileChannel 用法](https://www.cnblogs.com/robothy/p/14235598.html)。

代码示例：

```java
private void loadFileIntoMemory(File xmlFile) throws IOException {
  FileInputStream fis = new FileInputStream(xmlFile);
  // 创建 FileChannel 对象
  FileChannel fc = fis.getChannel();
  // FileChannle.map() 将文件映射到直接内存并返回 MappedByteBuffer 对象
  MappedByteBuffer mmb = fc.map(FileChannel.MapMode.READ_ONLY, 0, fc.size());
  xmlFileBuffer = new byte[(int)fc.size()];
  mmb.get(xmlFileBuffer);
  fis.close();
}
```

## 参考

- Java NIO浅析：<https://tech.meituan.com/2016/11/04/nio.html>

- 面试官：Java NIO 了解？https://mp.weixin.qq.com/s/mZobf-U8OSYQfHfYBEB6KA

  