---
title: Java 序列化详解
category: Java
tag:
  - Java基础
head:
  - - meta
    - name: keywords
      content: 序列化,反序列化,Serializable,transient,serialVersionUID,ObjectInputStream,ObjectOutputStream,协议
  - - meta
    - name: description
      content: 讲解 Java 对象的序列化/反序列化机制与关键细节，涵盖 transient、版本号与常见应用场景。
---

## 什么是序列化和反序列化?

如果我们需要持久化 Java 对象比如将 Java 对象保存在文件中，或者在网络传输 Java 对象，这些场景都需要用到序列化。

简单来说：

- **序列化**：将数据结构或对象转换成可以存储或传输的形式，通常是二进制字节流，也可以是 JSON, XML 等文本格式
- **反序列化**：将在序列化过程中所生成的数据转换为原始数据结构或者对象的过程

对于 Java 这种面向对象编程语言来说，我们序列化的都是对象（Object）也就是实例化后的类(Class)，但是在 C++这种半面向对象的语言中，struct(结构体)定义的是数据结构类型，而 class 对应的是对象类型。

下面是序列化和反序列化常见应用场景：

- 对象在进行网络传输（比如远程方法调用 RPC 的时候）之前需要先被序列化，接收到序列化的对象之后需要再进行反序列化；
- 将对象存储到文件之前需要进行序列化，将对象从文件中读取出来需要进行反序列化；
- 将对象存储到数据库（如 Redis）之前需要用到序列化，将对象从缓存数据库中读取出来需要反序列化；
- 将对象存储到内存之前需要进行序列化，从内存中读取出来之后需要进行反序列化。

维基百科是如是介绍序列化的：

> **序列化**（serialization）在计算机科学的数据处理中，是指将数据结构或对象状态转换成可取用格式（例如存成文件，存于缓冲，或经由网络中发送），以留待后续在相同或另一台计算机环境中，能恢复原先状态的过程。依照序列化格式重新获取字节的结果时，可以利用它来产生与原始对象相同语义的副本。对于许多对象，像是使用大量引用的复杂对象，这种序列化重建的过程并不容易。面向对象中的对象序列化，并不概括之前原始对象所关系的函数。这种过程也称为对象编组（marshalling）。从一系列字节提取数据结构的反向操作，是反序列化（也称为解编组、deserialization、unmarshalling）。

综上：**序列化的主要目的是通过网络传输对象或者说是将对象存储到文件系统、数据库、内存中。**

![](https://oss.javaguide.cn/github/javaguide/a478c74d-2c48-40ae-9374-87aacf05188c.png)

<p style="text-align:right;font-size:13px;color:gray">https://www.corejavaguru.com/java/serialization/interview-questions-1</p>

**序列化协议对应于 TCP/IP 4 层模型的哪一层？**

我们知道网络通信的双方必须要采用和遵守相同的协议。TCP/IP 四层模型是下面这样的，序列化协议属于哪一层呢？

1. 应用层
2. 传输层
3. 网络层
4. 网络接口层

![TCP/IP 四层模型](https://oss.javaguide.cn/github/javaguide/cs-basics/network/tcp-ip-4-model.png)

如上图所示，OSI 七层协议模型中，表示层做的事情主要就是对应用层的用户数据进行处理转换为二进制流。反过来的话，就是将二进制流转换成应用层的用户数据。这不就对应的是序列化和反序列化么？

因为，OSI 七层协议模型中的应用层、表示层和会话层对应的都是 TCP/IP 四层模型中的应用层，所以序列化协议属于 TCP/IP 协议应用层的一部分。

## 常见序列化协议有哪些？

JDK 自带的序列化方式一般不会用 ，因为序列化效率低并且存在安全问题。比较常用的序列化协议有 Hessian、Kryo、Protobuf、ProtoStuff，这些都是基于二进制的序列化协议。

像 JSON 和 XML 这种属于文本类序列化方式。虽然可读性比较好，但是性能较差，一般不会选择。

### JDK 自带的序列化方式

JDK 自带的序列化，只需实现 `java.io.Serializable`接口即可。

```java
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Builder
@ToString
public class RpcRequest implements Serializable {
    private static final long serialVersionUID = 1905122041950251207L;
    private String requestId;
    private String interfaceName;
    private String methodName;
    private Object[] parameters;
    private Class<?>[] paramTypes;
    private RpcMessageTypeEnum rpcMessageTypeEnum;
}
```

**serialVersionUID 有什么作用？**

序列化号 `serialVersionUID` 属于版本控制的作用。反序列化时，会检查 `serialVersionUID` 是否和当前类的 `serialVersionUID` 一致。如果 `serialVersionUID` 不一致则会抛出 `InvalidClassException` 异常。强烈推荐每个序列化类都手动指定其 `serialVersionUID`，如果不手动指定，那么编译器会动态生成默认的 `serialVersionUID`。

**serialVersionUID 不是被 static 变量修饰了吗？为什么还会被“序列化”？**

~~`static` 修饰的变量是静态变量，位于方法区，本身是不会被序列化的。 `static` 变量是属于类的而不是对象。你反序列之后，`static` 变量的值就像是默认赋予给了对象一样，看着就像是 `static` 变量被序列化，实际只是假象罢了。~~

**🐛 修正（参见：[issue#2174](https://github.com/Snailclimb/JavaGuide/issues/2174)）**：

通常情况下，`static` 变量是属于类的，不属于任何单个对象实例，所以它们本身不会被包含在对象序列化的数据流里。序列化保存的是对象的状态（也就是实例变量的值）。然而，`serialVersionUID` 是一个特例，`serialVersionUID` 的序列化做了特殊处理。关键在于，`serialVersionUID` 不是作为对象状态的一部分被序列化的，而是被序列化机制本身用作一个特殊的“指纹”或“版本号”。

当一个对象被序列化时，`serialVersionUID` 会被写入到序列化的二进制流中（像是在保存一个版本号，而不是保存 `static` 变量本身的状态）；在反序列化时，也会解析它并做一致性判断，以此来验证序列化对象的版本一致性。如果两者不匹配，反序列化过程将抛出 `InvalidClassException`，因为这通常意味着序列化的类的定义已经发生了更改，可能不再兼容。

官方说明如下：

> A serializable class can declare its own serialVersionUID explicitly by declaring a field named `"serialVersionUID"` that must be `static`, `final`, and of type `long`;
>
> 如果想显式指定 `serialVersionUID` ，则需要在类中使用 `static` 和 `final` 关键字来修饰一个 `long` 类型的变量，变量名字必须为 `"serialVersionUID"` 。

也就是说，`serialVersionUID` 本身（作为 static 变量）确实不作为对象状态被序列化。但是，它的值被 Java 序列化机制特殊处理了——作为一个版本标识符被读取并写入序列化流中，用于在反序列化时进行版本兼容性检查。

**如果有些字段不想进行序列化怎么办？**

对于不想进行序列化的变量，可以使用 `transient` 关键字修饰。

`transient` 关键字的作用是：阻止实例中那些用此关键字修饰的的变量序列化；当对象被反序列化时，被 `transient` 修饰的变量值不会被持久化和恢复。

关于 `transient` 还有几点注意：

- `transient` 只能修饰变量，不能修饰类和方法。
- For variables modified with `transient`, the variable value will be set to the default value of the type after deserialization. For example, if the `int` type is modified, the result after deserialization is `0`.
- `static` variables do not belong to any object (Object), so they will not be serialized regardless of whether they are modified with the `transient` keyword.

**Why is it not recommended to use the serialization that comes with JDK? **

We rarely or almost never directly use the serialization method that comes with JDK. The main reasons are as follows:

- **Cross-language calling is not supported**: It is not supported if services developed in other languages are called.
- **Poor performance**: Compared with other serialization frameworks, the performance is lower. The main reason is that the byte array after serialization is larger in size, resulting in increased transmission costs.
- **Security Issue**: There is no problem with serialization and deserialization per se. But when the input deserialized data can be controlled by the user, then the attacker can construct malicious input, let the deserialization generate unexpected objects, and execute the constructed arbitrary code in the process. Related reading: [Application Security: JAVA Deserialization Vulnerability - Cryin](https://cryin.github.io/blog/secure-development-java-deserialization-vulnerability/), [What’s going on with Java Deserialization Security Vulnerability? - Monica](https://www.zhihu.com/question/37562657/answer/1916596031).

### Kryo

Kryo is a high-performance serialization/deserialization tool that has high running speed and small bytecode size due to its variable-length storage characteristics and the use of bytecode generation mechanism.

In addition, Kryo is already a very mature serialization implementation and has been widely used in Twitter, Groupon, Yahoo, and many well-known open source projects (such as Hive and Storm).

[guide-rpc-framework](https://github.com/Snailclimb/guide-rpc-framework) uses kryo for serialization. The codes related to serialization and deserialization are as follows:

```java
/**
 * Kryo serialization class, Kryo serialization efficiency is very high, but only compatible with Java language
 *
 * @author shuang.kou
 * @createTime May 13, 2020 19:29:00
 */
@Slf4j
public class KryoSerializer implements Serializer {

    /**
     * Because Kryo is not thread safe. So, use ThreadLocal to store Kryo objects
     */
    private final ThreadLocal<Kryo> kryoThreadLocal = ThreadLocal.withInitial(() -> {
        Kryo kryo = new Kryo();
        kryo.register(RpcResponse.class);
        kryo.register(RpcRequest.class);
        return kryo;
    });

    @Override
    public byte[] serialize(Object obj) {
        try (ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
             Output output = new Output(byteArrayOutputStream)) {
            Kryo kryo = kryoThreadLocal.get();
            // Object->byte: Serialize the object into a byte array
            kryo.writeObject(output, obj);
            kryoThreadLocal.remove();
            return output.toBytes();
        } catch (Exception e) {
            throw new SerializeException("Serialization failed");
        }
    }

    @Override
    public <T> T deserialize(byte[] bytes, Class<T> clazz) {
        try (ByteArrayInputStream byteArrayInputStream = new ByteArrayInputStream(bytes);
             Input input = new Input(byteArrayInputStream)) {
            Kryo kryo = kryoThreadLocal.get();
            // byte->Object: Deserialize the object from the byte array
            Object o = kryo.readObject(input, clazz);
            kryoThreadLocal.remove();
            return clazz.cast(o);
        } catch (Exception e) {
            throw new SerializeException("Deserialization failed");
        }
    }

}
```

GitHub address: [https://github.com/EsotericSoftware/kryo](https://github.com/EsotericSoftware/kryo).

### Protobuf

Protobuf comes from Google, has excellent performance, supports multiple languages, and is cross-platform. It is too cumbersome to use because you need to define the IDL file yourself and generate the corresponding serialization code. Although this is inflexible, on the other hand, protobuf does not have the risk of serialization vulnerabilities.

> Protobuf contains definitions of serialization formats, libraries for various languages, and an IDL compiler. Normally you need to define a proto file and then use the IDL compiler to compile it into the language you need

A simple proto file is as follows:

```protobuf
// version of protobuf
syntax = "proto3";
// SearchRequest will be compiled into corresponding objects in different programming languages, such as class in Java and struct in Go.
message Person {
  //string type field
  string name = 1;
  // int type field
  int32 age = 2;
}
```

GitHub address: [https://github.com/protocolbuffers/protobuf](https://github.com/protocolbuffers/protobuf).

### ProtoStuff

Due to Protobuf's poor ease of use, its older brother Protostuff was born.

protostuff is based on Google protobuf, but provides more features and easier usage. Although it is easier to use, it does not mean that ProtoStuff's performance is worse.

GitHub address: [https://github.com/protostuff/protostuff](https://github.com/protostuff/protostuff).

### Hessian

Hessian is a lightweight, custom-described binary RPC protocol. Hessian is an older serialization implementation and is also cross-language.

![](https://oss.javaguide.cn/github/javaguide/8613ec4c-bde5-47bf-897e-99e0f90b9fa3.png)

The serialization method enabled by default in Dubbo2.x is Hessian2. However, Dubbo has modified Hessian2, but the general structure is still the same.

### Summary

Kryo is a serialization method specifically for the Java language and has very good performance. If your application is specifically for the Java language, you can consider using it. An article on the Dubbo official website mentioned that it is recommended to use Kryo as the serialization method for production environments. (Article address: <https://cn.dubbo.apache.org/zh-cn/docsv2.7/user/serialization/>).

![](https://oss.javaguide.cn/github/javaguide/java/569e541a-22b2-4846-aa07-0ad479f07440-20230814090158124.png)Things like Protobuf, ProtoStuff, and hessian are all cross-language serialization methods. You can consider using them if you have cross-language requirements.

In addition to the serialization methods I introduced above, there are also things like Thrift and Avro.

<!-- @include: @article-footer.snippet.md -->