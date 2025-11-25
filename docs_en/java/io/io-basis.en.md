---
title: Summary of Java IO basic knowledge
category: Java
tag:
  -JavaIO
  - Java basics
head:
  - - meta
    - name: keywords
      content: IO basics, byte stream, character stream, buffering, file operation, InputStream, Reader, OutputStream, Writer
  - - meta
    - name: description
      content: Overview of the basic concepts and core classes of Java IO, understanding byte/character streams, buffering, and file reading and writing.
---

<!-- @include: @small-advertisement.snippet.md -->

## Introduction to IO streams

IO is `Input/Output`, input and output. The process of inputting data into computer memory is called input, and the process of outputting data to external storage (such as database, file, remote host) is called output. The data transfer process is similar to water flow, so it is called IO flow. IO streams are divided into input streams and output streams in Java, and are further divided into byte streams and character streams according to the way data is processed.

More than 40 classes of Java IO streams are derived from the following 4 abstract class base classes.

- `InputStream`/`Reader`: The base class of all input streams, the former is a byte input stream, and the latter is a character input stream.
- `OutputStream`/`Writer`: The base class of all output streams, the former is a byte output stream, and the latter is a character output stream.

## Byte stream

### InputStream (byte input stream)

`InputStream` is used to read data (byte information) from the source (usually a file) into memory. The `java.io.InputStream` abstract class is the parent class of all byte input streams.

`InputStream` common methods:

- `read()`: Returns the next byte of data in the input stream. The value returned is between 0 and 255. If no bytes were read, the code returns `-1`, indicating end of file.
- `read(byte b[ ])` : Read some bytes from the input stream and store them in the array `b`. If the length of array `b` is zero, it is not read. If there are no bytes available to read, return `-1`. If there are bytes available to read, up to a maximum number of bytes read equal to `b.length`, the number of bytes read is returned. This method is equivalent to `read(b, 0, b.length)`.
- `read(byte b[], int off, int len)`: Based on the `read(byte b[ ])` method, the `off` parameter (offset) and the `len` parameter (the maximum number of bytes to be read) are added.
- `skip(long n)`: Ignore n bytes in the input stream and return the actual number of ignored bytes.
- `available()`: Returns the number of bytes that can be read in the input stream.
- `close()`: Close the input stream to release related system resources.

Starting from Java 9, `InputStream` has added several new practical methods:

- `readAllBytes()`: Read all bytes in the input stream and return a byte array.
- `readNBytes(byte[] b, int off, int len)`: Block until `len` bytes are read.
- `transferTo(OutputStream out)`: Transfer all bytes from an input stream to an output stream.

`FileInputStream` is a commonly used byte input stream object. It can directly specify the file path, read single-byte data directly, or read it into a byte array.

`FileInputStream` code example:

```java
try (InputStream fis = new FileInputStream("input.txt")) {
    System.out.println("Number of remaining bytes:"
            + fis.available());
    int content;
    long skip = fis.skip(2);
    System.out.println("The actual number of bytes skipped:" + skip);
    System.out.print("The content read from file:");
    while ((content = fis.read()) != -1) {
        System.out.print((char) content);
    }
} catch (IOException e) {
    e.printStackTrace();
}
```

`input.txt` file content:

![](https://oss.javaguide.cn/github/javaguide/java/image-20220419155214614.png)

Output:

```plain
Number of remaining bytes:11
The actual number of bytes skipped:2
The content read from file:JavaGuide
```

However, generally we do not use `FileInputStream` directly alone, but usually use it in conjunction with `BufferedInputStream` (byte buffered input stream, which will be discussed later).

Code like the following is relatively common in our projects. We read all bytes of the input stream through `readAllBytes()` and assign them directly to a `String` object.

```java
//Create a new BufferedInputStream object
BufferedInputStream bufferedInputStream = new BufferedInputStream(new FileInputStream("input.txt"));
// Read the contents of the file and copy it to the String object
String result = new String(bufferedInputStream.readAllBytes());
System.out.println(result);
```

`DataInputStream` is used to read data of specified types. It cannot be used alone and must be combined with other streams, such as `FileInputStream`.

```java
FileInputStream fileInputStream = new FileInputStream("input.txt");
//fileInputStream must be used as a construction parameter to use
DataInputStream dataInputStream = new DataInputStream(fileInputStream);
//Can read any specific type of data
dataInputStream.readBoolean();
dataInputStream.readInt();
dataInputStream.readUTF();
```

`ObjectInputStream` is used to read Java objects from the input stream (deserialization), and `ObjectOutputStream` is used to write objects to the output stream (serialization).

```java
ObjectInputStream input = new ObjectInputStream(new FileInputStream("object.data"));
MyClass object = (MyClass) input.readObject();
input.close();
```

In addition, the class used for serialization and deserialization must implement the `Serializable` interface. If there are properties in the object that do not want to be serialized, use `transient` to modify them.

### OutputStream (byte output stream)

`OutputStream` is used to write data (byte information) to a destination (usually a file). The `java.io.OutputStream` abstract class is the parent class of all byte output streams.

`OutputStream` common methods:

- `write(int b)`: Write specific bytes to the output stream.
- `write(byte b[ ])` : Write array `b` to the output stream, equivalent to `write(b, 0, b.length)`.
- `write(byte[] b, int off, int len)`: Based on the `write(byte b[ ])` method, the `off` parameter (offset) and the `len` parameter (the maximum number of bytes to be read) are added.
- `flush()`: Flushes this output stream and forces all buffered output bytes to be written out.
- `close()`: Close the output stream to release related system resources.

`FileOutputStream` is the most commonly used byte output stream object. It can directly specify the file path, directly output single-byte data, or output a specified byte array.

`FileOutputStream` code example:

```java
try (FileOutputStream output = new FileOutputStream("output.txt")) {
    byte[] array = "JavaGuide".getBytes();
    output.write(array);
} catch (IOException e) {
    e.printStackTrace();
}
```

Running results:![](https://oss.javaguide.cn/github/javaguide/java/image-20220419155514392.png)

Similar to `FileInputStream`, `FileOutputStream` is usually used with `BufferedOutputStream` (byte buffered output stream, discussed later).

```java
FileOutputStream fileOutputStream = new FileOutputStream("output.txt");
BufferedOutputStream bos = new BufferedOutputStream(fileOutputStream)
```

**`DataOutputStream`** is used to write specified types of data. It cannot be used alone and must be combined with other streams, such as `FileOutputStream`.

```java
//output stream
FileOutputStream fileOutputStream = new FileOutputStream("out.txt");
DataOutputStream dataOutputStream = new DataOutputStream(fileOutputStream);
// Output any data type
dataOutputStream.writeBoolean(true);
dataOutputStream.writeByte(1);
```

`ObjectInputStream` is used to read Java objects from the input stream (`ObjectInputStream`, deserialization), and `ObjectOutputStream` writes objects to the output stream (`ObjectOutputStream`, serialization).

```java
ObjectOutputStream output = new ObjectOutputStream(new FileOutputStream("file.txt")
Person person = new Person("Guide brother", "JavaGuide author");
output.writeObject(person);
```

## Character stream

Whether it is file reading and writing or network sending and receiving, the smallest storage unit of information is bytes. **Then why are I/O stream operations divided into byte stream operations and character stream operations? **

Personally, I think there are two main reasons:

- The character stream is obtained by converting bytes by the Java virtual machine. This process is quite time-consuming.
- If we don't know the encoding type, it is easy to have garbled characters.

The garbled code problem can be easily reproduced. We only need to change the content of the `input.txt` file in the `FileInputStream` code example mentioned above to Chinese. The original code does not need to be changed.

![](https://oss.javaguide.cn/github/javaguide/java/image-20220419154632551.png)

Output:

```java
Number of remaining bytes:9
The actual number of bytes skipped:2
The content read from file:§å®¶å¥½
```

It can be clearly seen that the read content has become garbled.

Therefore, the I/O stream simply provides an interface for directly operating characters, which facilitates our usual stream operations on characters. If audio files, pictures and other media files are better, it is better to use byte stream. If characters are involved, it is better to use character stream.

The character stream uses `Unicode` encoding by default, and we can customize the encoding through the construction method.

Unicode itself is just a character set that assigns a unique numerical number to each character and does not specify a specific storage method. UTF-8, UTF-16, and UTF-32 are all Unicode encoding methods, and they use different numbers of bytes to represent Unicode characters. For example, UTF-8: English occupies 1 byte, Chinese occupies 3 bytes.

### Reader (character input stream)

`Reader` is used to read data (character information) from the source (usually a file) into memory. The `java.io.Reader` abstract class is the parent class of all character input streams.

`Reader` is used to read text and `InputStream` is used to read raw bytes.

`Reader` common methods:

- `read()` : Read a character from the input stream.
- `read(char[] cbuf)` : Read some characters from the input stream and store them into the character array `cbuf`, equivalent to `read(cbuf, 0, cbuf.length)`.
- `read(char[] cbuf, int off, int len)`: Based on the `read(char[] cbuf)` method, the `off` parameter (offset) and the `len` parameter (the maximum number of characters to be read) are added.
- `skip(long n)`: Ignore n characters in the input stream and return the actual number of ignored characters.
- `close()` : Close the input stream and release related system resources.

`InputStreamReader` is a bridge that converts byte streams into character streams. Its subclass `FileReader` is an encapsulation based on this basis and can directly operate character files.

```java
//The bridge that converts byte stream to character stream
public class InputStreamReader extends Reader {
}
// Used to read character files
public class FileReader extends InputStreamReader {
}
```

`FileReader` code example:

```java
try (FileReader fileReader = new FileReader("input.txt");) {
    int content;
    long skip = fileReader.skip(3);
    System.out.println("The actual number of bytes skipped:" + skip);
    System.out.print("The content read from file:");
    while ((content = fileReader.read()) != -1) {
        System.out.print((char) content);
    }
} catch (IOException e) {
    e.printStackTrace();
}
```

`input.txt` file content:

![](https://oss.javaguide.cn/github/javaguide/java/image-20220419154632551.png)

Output:

```plain
The actual number of bytes skipped:3
The content read from file:I am Guide.
```

### Writer (character output stream)

`Writer` is used to write data (character information) to a destination (usually a file). The `java.io.Writer` abstract class is the parent class of all character output streams.

`Writer` common methods:

- `write(int c)` : Write a single character.
- `write(char[] cbuf)`: Write character array `cbuf`, equivalent to `write(cbuf, 0, cbuf.length)`.
- `write(char[] cbuf, int off, int len)`: Based on the `write(char[] cbuf)` method, the `off` parameter (offset) and the `len` parameter (the maximum number of characters to be read) are added.
- `write(String str)`: Write a string, equivalent to `write(str, 0, str.length())`.
- `write(String str, int off, int len)`: Based on the `write(String str)` method, the `off` parameter (offset) and the `len` parameter (the maximum number of characters to be read) are added.
- `append(CharSequence csq)`: Appends the specified character sequence to the specified `Writer` object and returns the `Writer` object.
- `append(char c)`: Appends the specified character to the specified `Writer` object and returns the `Writer` object.
- `flush()`: Flushes this output stream and forces all buffered output characters to be written out.
- `close()`: Close the output stream to release related system resources.

`OutputStreamWriter` is a bridge that converts character streams into byte streams. Its subclass `FileWriter` is an encapsulation based on this basis and can directly write characters to files.

```java
// Bridge that converts character stream to byte stream
public class OutputStreamWriter extends Writer {
}
// Used to write characters to the file
public class FileWriter extends OutputStreamWriter {
}
```

`FileWriter` code example:

```java
try (Writer output = new FileWriter("output.txt")) {
    output.write("Hello, I am Guide.");
} catch (IOException e) {
    e.printStackTrace();
}```

Output result:

![](https://oss.javaguide.cn/github/javaguide/java/image-20220419155802288.png)

## Byte buffer stream

IO operations are very performance-consuming. Buffered streams load data into buffers and read/write multiple bytes at one time, thereby avoiding frequent IO operations and improving stream transmission efficiency.

The byte buffer stream uses the decorator pattern to enhance the functionality of `InputStream` and `OutputStream` subclass objects.

For example, we can enhance the functionality of `FileInputStream` through `BufferedInputStream` (byte buffered input stream).

```java
//Create a new BufferedInputStream object
BufferedInputStream bufferedInputStream = new BufferedInputStream(new FileInputStream("input.txt"));
```

The performance difference between byte streams and byte buffer streams is mainly reflected in the fact that when we use both, we call `write(int b)` and `read()`, which only read one byte at a time. Since there is a buffer (byte array) inside the byte buffer stream, the byte buffer stream will first store the read bytes in the cache area, greatly reducing the number of IO times and improving reading efficiency.

I use the `write(int b)` and `read()` methods to copy a `524.9 mb` PDF file through the byte stream and the byte buffer stream respectively. The time-consuming comparison is as follows:

```plain
Total time taken to copy PDF files using buffered stream: 15428 milliseconds
Total time taken to copy PDF files using ordinary byte stream: 2555062 milliseconds
```

The time consumption difference between the two is very big. The time consumed by buffering stream is 1/165 of that of byte stream.

The test code is as follows:

```java
@Test
void copy_pdf_to_another_pdf_buffer_stream() {
    // Record start time
    long start = System.currentTimeMillis();
    try (BufferedInputStream bis = new BufferedInputStream(new FileInputStream("In-depth understanding of computer operating systems.pdf"));
         BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream("In-depth understanding of computer operating systems-copy.pdf"))) {
        int content;
        while ((content = bis.read()) != -1) {
            bos.write(content);
        }
    } catch (IOException e) {
        e.printStackTrace();
    }
    //record end time
    long end = System.currentTimeMillis();
    System.out.println("Total time taken to copy PDF files using buffered stream:" + (end - start) + " milliseconds");
}

@Test
void copy_pdf_to_another_pdf_stream() {
    // Record start time
    long start = System.currentTimeMillis();
    try (FileInputStream fis = new FileInputStream("In-depth understanding of computer operating systems.pdf");
         FileOutputStream fos = new FileOutputStream("In-depth understanding of computer operating systems-copy.pdf")) {
        int content;
        while ((content = fis.read()) != -1) {
            fos.write(content);
        }
    } catch (IOException e) {
        e.printStackTrace();
    }
    //record end time
    long end = System.currentTimeMillis();
    System.out.println("Total time taken to copy PDF files using normal stream:" + (end - start) + " milliseconds");
}
```

If you call `read(byte b[])` and `write(byte b[], int off, int len)`, which are two methods of writing a byte array, as long as the size of the byte array is appropriate, the performance gap between the two is actually not big and can basically be ignored.

This time we use the `read(byte b[])` and `write(byte b[], int off, int len)` methods to copy a 524.9 MB PDF file through the byte stream and the byte buffer stream respectively. The time-consuming comparison is as follows:

```plain
Total time taken to copy PDF files using buffered streaming: 695 milliseconds
Total time taken to copy PDF files using normal byte stream: 989 milliseconds
```

The time-consuming difference between the two is not very big, and the performance of buffered streaming is slightly better.

The test code is as follows:

```java
@Test
void copy_pdf_to_another_pdf_with_byte_array_buffer_stream() {
    // Record start time
    long start = System.currentTimeMillis();
    try (BufferedInputStream bis = new BufferedInputStream(new FileInputStream("In-depth understanding of computer operating systems.pdf"));
         BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream("In-depth understanding of computer operating systems-copy.pdf"))) {
        int len;
        byte[] bytes = new byte[4 * 1024];
        while ((len = bis.read(bytes)) != -1) {
            bos.write(bytes, 0, len);
        }
    } catch (IOException e) {
        e.printStackTrace();
    }
    //record end time
    long end = System.currentTimeMillis();
    System.out.println("Total time taken to copy PDF files using buffered stream:" + (end - start) + " milliseconds");
}

@Test
void copy_pdf_to_another_pdf_with_byte_array_stream() {
    // Record start time
    long start = System.currentTimeMillis();
    try (FileInputStream fis = new FileInputStream("In-depth understanding of computer operating systems.pdf");
         FileOutputStream fos = new FileOutputStream("In-depth understanding of computer operating systems-copy.pdf")) {
        int len;
        byte[] bytes = new byte[4 * 1024];
        while ((len = fis.read(bytes)) != -1) {
            fos.write(bytes, 0, len);
        }
    } catch (IOException e) {
        e.printStackTrace();
    }
    //record end time
    long end = System.currentTimeMillis();
    System.out.println("Total time taken to copy PDF files using normal stream:" + (end - start) + " milliseconds");
}
```

### BufferedInputStream (byte buffered input stream)

When `BufferedInputStream` reads data (byte information) from the source (usually a file) to the memory, it will not read byte by byte. Instead, it will first store the read bytes in the buffer area and read the bytes separately from the internal buffer. This greatly reduces the number of IOs and improves reading efficiency.

`BufferedInputStream` maintains a buffer internally, which is actually a byte array. You can get this conclusion by reading the `BufferedInputStream` source code.

```java
public
class BufferedInputStream extends FilterInputStream {
    // Internal buffer array
    protected volatile byte buf[];
    //Default size of buffer
    private static int DEFAULT_BUFFER_SIZE = 8192;
    // Use default buffer size
    public BufferedInputStream(InputStream in) {
        this(in, DEFAULT_BUFFER_SIZE);
    }
    // Custom buffer size
    public BufferedInputStream(InputStream in, int size) {
        super(in);
        if (size <= 0) {
            throw new IllegalArgumentException("Buffer size <= 0");
        }
        buf = new byte[size];
    }
}```

The buffer size defaults to **8192** bytes. Of course, you can also specify the buffer size through the `BufferedInputStream(InputStream in, int size)` constructor.

### BufferedOutputStream (byte buffered output stream)

When `BufferedOutputStream` writes data (byte information) to the destination (usually a file), it will not write byte by byte. Instead, it will first store the bytes to be written in the buffer area and write the bytes individually from the internal buffer. This greatly reduces the number of IOs and improves efficiency.

```java
try (BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream("output.txt"))) {
    byte[] array = "JavaGuide".getBytes();
    bos.write(array);
} catch (IOException e) {
    e.printStackTrace();
}
```

Similar to `BufferedInputStream`, `BufferedOutputStream` also maintains a buffer internally, and the size of this buffer is also **8192** bytes.

## Character buffer stream

`BufferedReader` (character buffered input stream) and `BufferedWriter` (character buffered output stream) are similar to `BufferedInputStream` (byte buffered input stream) and `BufferedOutputStream` (byte buffered input stream), and internally maintain a byte array as a buffer. However, the former is mainly used to operate character information.

## Print stream

Do you use the following code often?

```java
System.out.print("Hello!");
System.out.println("Hello!");
```

`System.out` is actually used to obtain a `PrintStream` object, and the `print` method actually calls the `write` method of the `PrintStream` object.

`PrintStream` belongs to the byte printing stream, corresponding to `PrintWriter` (character printing stream). `PrintStream` is a subclass of `OutputStream`, and `PrintWriter` is a subclass of `Writer`.

```java
public class PrintStream extends FilterOutputStream
    implements Appendable, Closeable {
}
public class PrintWriter extends Writer {
}
```

## Random access stream

The random access stream to be introduced here refers to `RandomAccessFile` that supports jumping to any location in the file for reading and writing.

The construction method of `RandomAccessFile` is as follows, we can specify `mode` (read and write mode).

```java
// The openAndDelete parameter defaults to false, which means the file is opened and the file will not be deleted.
public RandomAccessFile(File file, String mode)
    throws FileNotFoundException {
    this(file, mode, false);
}
// private method
private RandomAccessFile(File file, String mode, boolean openAndDelete) throws FileNotFoundException{
  // Omit most of the code
}
```

There are four main reading and writing modes:

- `r` : read-only mode.
- `rw`: read and write mode
- `rws`: Relative to `rw`, `rws` synchronously updates the modifications to the "file content" or "metadata" to the external storage device.
- `rwd`: Relative to `rw`, `rwd` synchronously updates the modifications to the "content of the file" to the external storage device.

File content refers to the data actually saved in the file, and metadata is used to describe file attributes such as file size information, creation and modification time.

There is a file pointer in `RandomAccessFile` used to indicate the location of the next byte to be written or read. We can set the offset of the file pointer (poss bytes from the beginning of the file) through the `seek(long pos)` method of `RandomAccessFile`. If you want to get the current position of the file pointer, you can use the `getFilePointer()` method.

`RandomAccessFile` code example:

```java
RandomAccessFile randomAccessFile = new RandomAccessFile(new File("input.txt"), "rw");
System.out.println("Offset before reading: " + randomAccessFile.getFilePointer() + ", currently read character " + (char) randomAccessFile.read() + ", offset after reading: " + randomAccessFile.getFilePointer());
//The current offset of the pointer is 6
randomAccessFile.seek(6);
System.out.println("Offset before reading: " + randomAccessFile.getFilePointer() + ", currently read character " + (char) randomAccessFile.read() + ", offset after reading: " + randomAccessFile.getFilePointer());
//Write byte data backward starting from offset 7
randomAccessFile.write(new byte[]{'H', 'I', 'J', 'K'});
//The current offset of the pointer is 0, return to the starting position
randomAccessFile.seek(0);
System.out.println("Offset before reading: " + randomAccessFile.getFilePointer() + ", currently read character " + (char) randomAccessFile.read() + ", offset after reading: " + randomAccessFile.getFilePointer());
```

`input.txt` file content:

![](https://oss.javaguide.cn/github/javaguide/java/image-20220421162050158.png)

Output:

```plain
Offset before reading: 0, currently read character A, offset after reading: 1
Offset before reading: 6, currently read character G, offset after reading: 7
Offset before reading: 0, currently read character A, offset after reading: 1
```

The content of the `input.txt` file becomes `ABCDEFGHIJK`.

The `write` method of `RandomAccessFile` will overwrite it if there is data in the corresponding location when writing the object.

```java
RandomAccessFile randomAccessFile = new RandomAccessFile(new File("input.txt"), "rw");
randomAccessFile.write(new byte[]{'H', 'I', 'J', 'K'});
```

Assume that the content of the `input.txt` file changes to `ABCD` before running the above program, and changes to `HIJK` after running it.

One of the more common applications of `RandomAccessFile` is to implement **resumable upload** of large files. What is resume transfer? To put it simply, after the file upload is suspended or fails (for example, if you encounter a network problem), you do not need to re-upload it. You only need to upload the file fragments that were not successfully uploaded. Segmented upload (first split the file into multiple file segments) is the basis for resumed upload.

`RandomAccessFile` can help us merge file fragments. The sample code is as follows:

![](https://oss.javaguide.cn/github/javaguide/java/io/20210609164749122.png)

I introduced the problem of uploading large files in detail in ["Java Interview Guide"](https://javaguide.cn/zhuanlan/java-mian-shi-zhi-bei.html).

![](https://oss.javaguide.cn/github/javaguide/java/image-20220428104115362.png)

The implementation of `RandomAccessFile` depends on `FileDescriptor` (file descriptor) and `FileChannel` (memory mapped file).

<!-- @include: @article-footer.snippet.md -->