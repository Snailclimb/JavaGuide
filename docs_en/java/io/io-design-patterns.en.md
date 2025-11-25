---
title: Summary of Java IO design patterns
category: Java
tag:
  -JavaIO
  - Java basics
head:
  - - meta
    - name: keywords
      content: IO design pattern, decorator, adapter, chain of responsibility, streaming processing, FilterInputStream
  - - meta
    - name: description
      content: Combine design patterns to understand the class structure and extension methods of Java IO, and master the typical usage of stream processing.
---

In this article, we will briefly take a look at the applications of design patterns that we can learn from IO.

## Decorator pattern

**Decorator pattern** can expand the functionality of the original object without changing it.

The decorator pattern extends the functionality of the original class through combination instead of inheritance, and is more practical in some scenarios where the inheritance relationship is more complex (the inheritance relationship of various classes in the IO scenario is more complex).

For byte streams, `FilterInputStream` (corresponding to the input stream) and `FilterOutputStream` (corresponding to the output stream) are the core of the decorator pattern, used to enhance the functions of `InputStream` and `OutputStream` subclass objects respectively.

Our common `BufferedInputStream` (byte buffered input stream), `DataInputStream`, etc. are all subclasses of `FilterInputStream`, `BufferedOutputStream` (byte buffered output stream), `DataOutputStream`, etc. are all subclasses of `FilterOutputStream`.

For example, we can enhance the functionality of `FileInputStream` through `BufferedInputStream` (byte buffered input stream).

The `BufferedInputStream` constructor is as follows:

```java
public BufferedInputStream(InputStream in) {
    this(in, DEFAULT_BUFFER_SIZE);
}

public BufferedInputStream(InputStream in, int size) {
    super(in);
    if (size <= 0) {
        throw new IllegalArgumentException("Buffer size <= 0");
    }
    buf = new byte[size];
}
```

It can be seen that one of the parameters of the constructor of `BufferedInputStream` is `InputStream`.

`BufferedInputStream` code example:

```java
try (BufferedInputStream bis = new BufferedInputStream(new FileInputStream("input.txt"))) {
    int content;
    long skip = bis.skip(2);
    while ((content = bis.read()) != -1) {
        System.out.print((char) content);
    }
} catch (IOException e) {
    e.printStackTrace();
}
```

At this time, you may be thinking: **Why don’t we just create a `BufferedFileInputStream` (character buffered file input stream)? **

```java
BufferedFileInputStream bfis = new BufferedFileInputStream("input.txt");
```

This is fine if there are only a few subclasses of `InputStream`. However, there are too many subclasses of `InputStream`, and the inheritance relationship is too complicated. Wouldn't it be too troublesome if we customized a corresponding buffered input stream for each subclass?

If you are familiar with IO streams, you will find that `ZipInputStream` and `ZipOutputStream` can also enhance the capabilities of `BufferedInputStream` and `BufferedOutputStream` respectively.

```java
BufferedInputStream bis = new BufferedInputStream(new FileInputStream(fileName));
ZipInputStream zis = new ZipInputStream(bis);

BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream(fileName));
ZipOutputStream zipOut = new ZipOutputStream(bos);
```

`ZipInputStream` and `ZipOutputStream` inherit from `InflaterInputStream` and `DeflaterOutputStream` respectively.

```java
public
class InflaterInputStream extends FilterInputStream {
}

public
class DeflaterOutputStream extends FilterOutputStream {
}

```

This is also a very important feature of the decorator pattern, that is, multiple decorators can be nested on the original class.

In order to achieve this effect, the decorator class needs to inherit the same abstract class or implement the same interface as the original class. The common parent classes of these IO-related decoration classes and original classes introduced above are `InputStream` and `OutputStream`.

For character streams, `BufferedReader` can be used to increase the functionality of the `Reader` (character input stream) subclass, and `BufferedWriter` can be used to increase the functionality of the `Writer` (character output stream) subclass.

```java
BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(fileName), "UTF-8"));
```

There are so many examples of decorator pattern applications in IO streams that you don’t need to remember them specially. It’s completely unnecessary! After understanding the core of the decorator pattern, you will naturally know where the decorator pattern is used when using it.

## Adapter mode

**Adapter Pattern** is mainly used for coordination of classes with incompatible interfaces. You can think of it like the power adapter we often use every day.

The object or class that exists in the adapter pattern is called Adaptee, and the object or class that acts on the adapter is called Adapter. Adapters are divided into object adapters and class adapters. Class adapters are implemented using inheritance relationships, and object adapters are implemented using composition relationships.

The character stream and byte stream in the IO stream have different interfaces. The coordination between them is based on the adapter mode, more precisely, it is an object adapter. Through the adapter, we can adapt the byte stream object into a character stream object, so that we can read or write character data directly through the byte stream object.

`InputStreamReader` and `OutputStreamWriter` are two adapters (Adapter). At the same time, they are also the bridge between byte stream and character stream. `InputStreamReader` uses `StreamDecoder` (stream decoder) to decode bytes, ** realize the conversion of byte stream to character stream, ** `OutputStreamWriter` uses `StreamEncoder` (stream encoder) to encode characters, and realize the conversion of character stream to byte stream.

Subclasses of `InputStream` and `OutputStream` are adaptees, and `InputStreamReader` and `OutputStreamWriter` are adapters.

```java
// InputStreamReader is the adapter, FileInputStream is the adapted class
InputStreamReader isr = new InputStreamReader(new FileInputStream(fileName), "UTF-8");
// BufferedReader enhances the functionality of InputStreamReader (decorator mode)
BufferedReader bufferedReader = new BufferedReader(isr);
```

`java.io.InputStreamReader` Part of the source code:

```java
public class InputStreamReader extends Reader {
    //Object used for decoding
    private final StreamDecoder sd;
    public InputStreamReader(InputStream in) {
        super(in);
        try {
            // Get the StreamDecoder object
            sd = StreamDecoder.forInputStreamReader(in, this, (String)null);
        } catch (UnsupportedEncodingException e) {
            throw new Error(e);
        }
    }
    //Use the StreamDecoder object to do specific reading work
    public int read() throws IOException {
        return sd.read();
    }
}```

`java.io.OutputStreamWriter` Part of the source code:

```java
public class OutputStreamWriter extends Writer {
    // Object used for encoding
    private final StreamEncoder se;
    public OutputStreamWriter(OutputStream out) {
        super(out);
        try {
           // Get the StreamEncoder object
            se = StreamEncoder.forOutputStreamWriter(out, this, (String)null);
        } catch (UnsupportedEncodingException e) {
            throw new Error(e);
        }
    }
    //Use the StreamEncoder object to do specific writing work
    public void write(int c) throws IOException {
        se.write(c);
    }
}
```

**What is the difference between adapter mode and decorator mode? **

**Decorator Pattern** focuses more on dynamically enhancing the functionality of the original class. The decorator class needs to inherit the same abstract class or implement the same interface as the original class. Moreover, the decorator pattern supports the nested use of multiple decorators on the original class.

**Adapter pattern** focuses more on allowing classes whose interfaces are incompatible and cannot interact to work together. When we call the corresponding method of the adapter, the adapter class will internally call the method of the adapter class or the class related to the adapter class. This process is transparent. For example, `StreamDecoder` (stream decoder) and `StreamEncoder` (stream encoder) obtain the `FileChannel` object based on `InputStream` and `OutputStream` respectively and call the corresponding `read` method and `write` method to read and write byte data.

```java
StreamDecoder(InputStream in, Object lock, CharsetDecoder dec) {
    // Omit most of the code
    // Get the FileChannel object based on the InputStream object
    ch = getChannel((FileInputStream)in);
}
```

Both adapters and adapters do not need to inherit the same abstract class or implement the same interface.

In addition, the `FutureTask` class uses the adapter pattern. The implementation of the `RunnableAdapter` internal class of `Executors` belongs to the adapter and is used to adapt `Runnable` to `Callable`.

The `FutureTask` parameter contains a constructor of `Runnable`:

```java
public FutureTask(Runnable runnable, V result) {
    // Call the callable method of the Executors class
    this.callable = Executors.callable(runnable, result);
    this.state = NEW;
}
```

Corresponding methods and adapters in `Executors`:

```java
// What is actually called is the constructor of the internal class RunnableAdapter of Executors
public static <T> Callable<T> callable(Runnable task, T result) {
    if (task == null)
        throw new NullPointerException();
    return new RunnableAdapter<T>(task, result);
}
// adapter
static final class RunnableAdapter<T> implements Callable<T> {
    final Runnable task;
    final T result;
    RunnableAdapter(Runnable task, T result) {
        this.task = task;
        this.result = result;
    }
    public T call() {
        task.run();
        return result;
    }
}
```

## Factory pattern

Factory mode is used to create objects. Factory mode is widely used in NIO. For example, the `newInputStream` method of the `Files` class is used to create an `InputStream` object (static factory), the `get` method of the `Paths` class creates a `Path` object (static factory), and the `ZipFileSystem` class (a class under the `sun.nio` package, belonging to some internal implementations related to `java.nio`) The `getPath` method creates a `Path` object (simple factory).

```java
InputStream is = Files.newInputStream(Paths.get(generatorLogoPath))
```

## Observer pattern

The file directory listening service in NIO uses the observer mode.

The file directory listening service in NIO is based on the `WatchService` interface and the `Watchable` interface. `WatchService` belongs to the observer, and `Watchable` belongs to the observed.

The `Watchable` interface defines a method `register` for registering objects to `WatchService` (monitoring service) and binding listening events.

```java
public interface Path
    extends Comparable<Path>, Iterable<Path>, Watchable{
}

public interface Watchable {
    WatchKey register(WatchService watcher,
                      WatchEvent.Kind<?>[] events,
                      WatchEvent.Modifier... modifiers)
        throws IOException;
}
```

`WatchService` is used to monitor changes in file directories. The same `WatchService` object can monitor multiple file directories.

```java
// Create WatchService object
WatchService watchService = FileSystems.getDefault().newWatchService();

//Initialize the Path class of a monitored folder:
Path path = Paths.get("workingDirectory");
//Register this path object to WatchService (monitoring service)
WatchKey watchKey = path.register(
watchService, StandardWatchEventKinds...);
```

The second parameter `events` (the events that need to be monitored) of the `register` method of the `Path` class is a variable-length parameter, which means that we can listen to multiple events at the same time.

```java
WatchKey register(WatchService watcher,
                  WatchEvent.Kind<?>... events)
    throws IOException;
```

There are three commonly used listening events:

- `StandardWatchEventKinds.ENTRY_CREATE`: File creation.
- `StandardWatchEventKinds.ENTRY_DELETE` : File deletion.
- `StandardWatchEventKinds.ENTRY_MODIFY` : File modification.

The `register` method returns a `WatchKey` object. Through the `WatchKey` object, you can obtain the specific information of the event, such as whether the file was created, deleted or modified in the file directory, and what is the specific name of the file that was created, deleted or modified.

```java
WatchKey key;
while ((key = watchService.take()) != null) {
    for (WatchEvent<?> event : key.pollEvents()) {
      // You can call the method of the WatchEvent object to do some things, such as output the specific context information of the event.
    }
    key.reset();
}
```

`WatchService` internally uses a daemon thread to detect file changes in a regular polling manner. The simplified source code is as follows.

```java
classPollingWatchService
    extends AbstractWatchService
{
    //Define a daemon thread to poll and detect file changes
    private final ScheduledExecutorService scheduledExecutor;

    PollingWatchService() {
        scheduledExecutor = Executors
            .newSingleThreadScheduledExecutor(new ThreadFactory() {
                 @Override
                 public Thread newThread(Runnable r) {
                     Thread t = new Thread(r);
                     t.setDaemon(true);
                     return t;
                 }});
    }

  void enable(Set<? extends WatchEvent.Kind<?>> events, long period) {
    synchronized (this) {
      //Update listening events
      this.events = events;

        // Start regular polling
      Runnable thunk = new Runnable() { public void run() { poll(); }};
      this.poller = scheduledExecutor
        .scheduleAtFixedRate(thunk, period, period, TimeUnit.SECONDS);
    }
  }
}```

## Reference

- Patterns in Java APIs: <http://cecs.wright.edu/~tkprasad/courses/ceg860/paper/node26.html>
- Decorator pattern: Learn the decorator pattern by analyzing the Java IO class library source code: <https://time.geekbang.org/column/article/204845>
- What is the sun.nio package? Is it java code? - RednaxelaFX <https://www.zhihu.com/question/29237781/answer/43653953>

<!-- @include: @article-footer.snippet.md -->