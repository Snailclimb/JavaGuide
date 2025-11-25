---
title: Summary of JDK monitoring and troubleshooting tools
category: Java
tag:
  - JVM
head:
  - - meta
    - name: keywords
      content: JDK tools, jps, jstat, jmap, jstack, jvisualvm, diagnosis, monitoring
  - - meta
    - name: description
      content: Summarizes common JDK monitoring and debugging tools and usage examples to assist in locating and analyzing JVM problems.
---

## JDK command line tools

These commands are in the bin directory of the JDK installation directory:

- **`jps`** (JVM Process Status): Similar to the UNIX `ps` command. Used to view information such as startup classes, incoming parameters, and Java virtual machine parameters of all Java processes;
- **`jstat`** (JVM Statistics Monitoring Tool): used to collect various aspects of running data of the HotSpot virtual machine;
- **`jinfo`** (Configuration Info for Java): Configuration Info for Java, displays virtual machine configuration information;
- **`jmap`** (Memory Map for Java): generate a heap dump snapshot;
- **`jhat`** (JVM Heap Dump Browser): Used to analyze heapdump files. It will establish an HTTP/HTML server so that users can view the analysis results on the browser. JDK9 removed jhat;
- **`jstack`** (Stack Trace for Java): Generate a thread snapshot of the virtual machine at the current moment. The thread snapshot is the collection of method stacks being executed by each thread in the current virtual machine.

### `jps`: View all Java processes

The `jps` (JVM Process Status) command is similar to the UNIX `ps` command.

`jps`: Displays the virtual machine execution main class name and the local virtual machine unique ID (Local Virtual Machine Identifier, LVMID) of these processes. `jps -q`: Only output the unique ID of the local virtual machine of the process.

```powershell
C:\Users\SnailClimb>jps
7360 NettyClient2
17396
7972 Launcher
16504Jps
17340 NettyServer
```

`jps -l`: Output the full name of the main class. If the process executes a Jar package, output the Jar path.

```powershell
C:\Users\SnailClimb>jps -l
7360 firstNettyDemo.NettyClient2
17396
7972 org.jetbrains.jps.cmdline.Launcher
16492 sun.tools.jps.Jps
17340 firstNettyDemo.NettyServer
```

`jps -v`: Output the JVM parameters when the virtual machine process starts.

`jps -m`: Output the parameters passed to the main() function of the Java process.

### `jstat`: Monitor various running status information of virtual machines

jstat (JVM Statistics Monitoring Tool) is a command line tool used to monitor various running status information of virtual machines. It can display class information, memory, garbage collection, JIT compilation and other running data in the virtual machine process locally or remotely (requires RMI support from the remote host). On servers that do not have a GUI and only provide a plain text console environment, it will be the first choice tool to locate virtual machine performance problems during operation.

**`jstat` command usage format:**

```powershell
jstat -<option> [-t] [-h<lines>] <vmid> [<interval> [<count>]]
```

For example, `jstat -gc -h3 31736 1000 10` means to analyze the gc situation with process ID 31736, print a record every 1000ms, stop printing 10 times, and print the indicator header after every 3 lines.

**Common options are as follows:**

- `jstat -class vmid`: displays ClassLoader related information;
- `jstat -compiler vmid`: displays information related to JIT compilation;
- `jstat -gc vmid`: displays heap information related to GC;
- `jstat -gccapacity vmid`: displays the capacity and usage of each generation;
- `jstat -gcnew vmid`: displays new generation information;
- `jstat -gcnewcapcacity vmid`: displays the size and usage of the new generation;
- `jstat -gcold vmid`: Displays behavioral statistics of the old generation and permanent generation. Starting from jdk1.8, this option only represents the old generation because the permanent generation has been removed;
- `jstat -gcoldcapacity vmid`: displays the size of the old generation;
- `jstat -gcpermcapacity vmid`: Display the permanent generation size. Starting from jdk1.8, this option no longer exists because the permanent generation has been removed;
- `jstat -gcutil vmid`: displays garbage collection information;

In addition, adding the `-t` parameter can add a Timestamp column to the output information to display the running time of the program.

### `jinfo`: View and adjust virtual machine parameters in real time

`jinfo vmid`: Output all parameters and system properties of the current jvm process (the first part is the system properties, the second part is the JVM parameters).

`jinfo -flag name vmid`: Output the specific value of the parameter corresponding to the name. For example, output MaxHeapSize and check whether the current jvm process enables printing of GC logs (`-XX:PrintGCDetails`: detailed GC log mode, both of which are turned off by default).

```powershell
C:\Users\SnailClimb>jinfo -flag MaxHeapSize 17340
-XX:MaxHeapSize=2124414976
C:\Users\SnailClimb>jinfo -flag PrintGC 17340
-XX:-PrintGC
```

Using jinfo, you can dynamically modify jvm parameters without restarting the virtual machine. This is especially useful in an online environment. Please see the following example:

`jinfo -flag [+|-]name vmid` turns on or off the parameter of the corresponding name.

```powershell
C:\Users\SnailClimb>jinfo -flag PrintGC 17340
-XX:-PrintGC

C:\Users\SnailClimb>jinfo -flag +PrintGC 17340

C:\Users\SnailClimb>jinfo -flag PrintGC 17340
-XX:+PrintGC
```

### `jmap`: Generate heap dump snapshot

The `jmap` (Memory Map for Java) command is used to generate a heap dump snapshot. If you do not use the `jmap` command and want to obtain a Java heap dump, you can use the `"-XX:+HeapDumpOnOutOfMemoryError"` parameter, which allows the virtual machine to automatically generate a dump file after an OOM exception occurs. Under the Linux command, you can send a process exit signal through `kill -3` to get the dump file.

The role of `jmap` is not just to obtain dump files, it can also query the finalizer execution queue, Java heap and permanent generation details, such as space usage, which collector is currently used, etc. Like `jinfo`, `jmap` has many functions that are restricted on the Windows platform.

Example: Output a heap snapshot of the specified application to the desktop. Later, the heap file can be analyzed through tools such as jhat and Visual VM.

```powershell
C:\Users\SnailClimb>jmap -dump:format=b,file=C:\Users\SnailClimb\Desktop\heap.hprof 17340
Dumping heap to C:\Users\SnailClimb\Desktop\heap.hprof ...
Heap dump file created
```

### **`jhat`**: Analyze heapdump files

**`jhat`** is used to analyze heapdump files. It will establish an HTTP/HTML server so that users can view the analysis results on the browser.

```powershell
C:\Users\SnailClimb>jhat C:\Users\SnailClimb\Desktop\heap.hprof
Reading from C:\Users\SnailClimb\Desktop\heap.hprof...
Dump file created Sat May 04 12:30:31 CST 2019
Snapshot read, resolving...
Resolving 131419 objects...
Chasing references, expect 26 dots........................
Eliminating duplicate references........................
Snapshot resolved.
Started HTTP server on port 7000
Server is ready.```

Visit <http://localhost:7000/>

Note⚠️: JDK9 removed jhat ([JEP 241: Remove the jhat Tool](https://openjdk.org/jeps/241)), you can use its alternatives Eclipse Memory Analyzer Tool (MAT) and VisualVM, which are also officially recommended.

### **`jstack`**: Generate a thread snapshot of the virtual machine at the current moment

The `jstack` (Stack Trace for Java) command is used to generate a thread snapshot of the virtual machine at the current moment. A thread snapshot is a collection of method stacks being executed by each thread in the current virtual machine.

The purpose of generating thread snapshots is mainly to locate the reasons for long-term thread pauses, such as inter-thread deadlocks, infinite loops, long waits caused by requesting external resources, etc., which are all causes of long-term thread pauses. When a thread pauses, you can check the call stack of each thread through `jstack` to know what the unresponsive thread is doing in the background or what resources it is waiting for.

**The following is a thread deadlock code. We will use the `jstack` command to check the deadlock, output the deadlock information, and find the thread where the deadlock occurred. **

```java
public class DeadLockDemo {
    private static Object resource1 = new Object();//resource 1
    private static Object resource2 = new Object();//Resource 2

    public static void main(String[] args) {
        new Thread(() -> {
            synchronized (resource1) {
                System.out.println(Thread.currentThread() + "get resource1");
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                System.out.println(Thread.currentThread() + "waiting get resource2");
                synchronized (resource2) {
                    System.out.println(Thread.currentThread() + "get resource2");
                }
            }
        }, "Thread 1").start();

        new Thread(() -> {
            synchronized (resource2) {
                System.out.println(Thread.currentThread() + "get resource2");
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                System.out.println(Thread.currentThread() + "waiting get resource1");
                synchronized (resource1) {
                    System.out.println(Thread.currentThread() + "get resource1");
                }
            }
        }, "Thread 2").start();
    }
}
```

Output

```plain
Thread[thread 1,5,main]get resource1
Thread[thread 2,5,main]get resource2
Thread[thread 1,5,main]waiting get resource2
Thread[thread 2,5,main]waiting get resource1
```

Thread A obtains the monitor lock of resource1 through synchronized (resource1), and then makes thread A sleep for 1s through `Thread.sleep(1000);` in order to allow thread B to be executed and obtain the monitor lock of resource2. After thread A and thread B end their sleep, they both start trying to request each other's resources, and then the two threads will fall into a state of waiting for each other, which will cause a deadlock.

**Analysis via `jstack` command:**

```powershell
C:\Users\SnailClimb>jps
13792 KotlinCompileDaemon
7360 NettyClient2
17396
7972 Launcher
8932 Launcher
9256 DeadLockDemo
10764Jps
17340 NettyServer

C:\Users\SnailClimb>jstack 9256
```

Part of the output is as follows:

```powershell
Found one Java-level deadlock:
=============================
"Thread 2":
  waiting to lock monitor 0x000000000333e668 (object 0x00000000d5efe1c0, a java.lang.Object),
  which is held by "thread 1"
"Thread 1":
  waiting to lock monitor 0x000000000333be88 (object 0x00000000d5efe1d0, a java.lang.Object),
  which is held by "thread 2"

Java stack information for the threads listed above:
===================================================
"Thread 2":
        at DeadLockDemo.lambda$main$1(DeadLockDemo.java:31)
        - waiting to lock <0x00000000d5efe1c0> (a java.lang.Object)
        - locked <0x00000000d5efe1d0> (a java.lang.Object)
        at DeadLockDemo$$Lambda$2/1078694789.run(Unknown Source)
        at java.lang.Thread.run(Thread.java:748)
"Thread 1":
        at DeadLockDemo.lambda$main$0(DeadLockDemo.java:16)
        - waiting to lock <0x00000000d5efe1d0> (a java.lang.Object)
        - locked <0x00000000d5efe1c0> (a java.lang.Object)
        at DeadLockDemo$$Lambda$1/1324119927.run(Unknown Source)
        at java.lang.Thread.run(Thread.java:748)

Found 1 deadlock.
```

You can see that the `jstack` command has helped us find the specific information of the thread where the deadlock occurred.

## JDK visual analysis tool

### JConsole:Java Monitoring and Management Console

JConsole is a visual monitoring and management tool based on JMX. It is easy to monitor the memory usage of the java process of local and remote servers. You can enter the `jconsole` command in the console to start or find `jconsole.exe` in the bin directory under the JDK directory and double-click to start.

#### Connect to Jconsole

![Connect Jconsole](./pictures/jdk monitoring and troubleshooting tool summary/1JConsole connection.png)

If you need to use JConsole to connect to a remote process, you can add the following parameters when starting the remote Java program:

```properties
-Djava.rmi.server.hostname=External network access ip address
-Dcom.sun.management.jmxremote.port=60001 //Monitoring port number
-Dcom.sun.management.jmxremote.authenticate=false //Turn off authentication
-Dcom.sun.management.jmxremote.ssl=false```

When connecting using JConsole, the remote process address is as follows:

```plain
External network access IP address: 60001
```

#### View Java program overview

![View Java program overview](./pictures/jdk monitoring and troubleshooting tool summary/2View Java program overview.png)

#### Memory monitoring

JConsole can display detailed information about the current memory. It not only includes the overall information of heap memory/non-heap memory, but also can be refined to the usage of eden area, survivor area, etc., as shown in the figure below.

Click the "Perform GC(G)" button on the right to force the application to perform a Full GC.

> - **New Generation GC (Minor GC)**: Refers to the garbage collection action that occurs in the New Generation. Minor GC is very frequent and the recycling speed is generally relatively fast.
> - **Old generation GC (Major GC/Full GC)**: refers to the GC that occurs in the old generation. The occurrence of Major GC is often accompanied by at least one Minor GC (not absolutely). The speed of Major GC is generally more than 10 times slower than that of Minor GC.

![Memory Monitoring](./pictures/JDK Monitoring and Troubleshooting Tool Summary/3Memory Monitoring.png)

#### Thread monitoring

Similar to the `jstack` command we talked about earlier, but this one is visual.

There is a "Detect Deadlock (D)" button at the bottom. Click this button to automatically find the threads in which the deadlock occurred and their detailed information.

![Thread Monitoring](./pictures/JDK Monitoring and Troubleshooting Tool Summary/4 Thread Monitoring.png)

### Visual VM: All-in-one troubleshooting tool

VisualVM provides detailed information about Java applications running on a Java Virtual Machine (JVM). In the graphical user interface of VisualVM, you can view relevant information of multiple Java applications conveniently and quickly. Visual VM official website: <https://visualvm.github.io/>. Visual VM Chinese documentation: <https://visualvm.github.io/documentation.html>.

The following passage is excerpted from "In-depth Understanding of Java Virtual Machine".

> VisualVM (All-in-One Java Troubleshooting Tool) is the most powerful running monitoring and fault handling program released with the JDK so far. The official description of "All-in-One" is written in the software description of VisualVM, which indicates that in addition to running monitoring and fault handling, it also provides many other functions, such as performance analysis (Profiling). VisualVM's performance analysis function is not much inferior to professional and paid profiling tools such as JProfiler and YourKit. VisualVM also has a great advantage: it does not require the monitored program to run based on a special Agent, so it has very little impact on the actual performance of the application, allowing it to be directly applied in a production environment. This advantage is unmatched by tools such as JProfiler and YourKit.

VisualVM is developed based on the NetBeans platform, so it has plug-in extension features from the beginning. Through plug-in extension support, VisualVM can do:

- Display the virtual machine process and its configuration and environment information (jps, jinfo).
- Monitor the application's CPU, GC, heap, method area and thread information (jstat, jstack).
- dump and analyze heap dump snapshots (jmap, jhat).
- Method-level program running performance analysis to find the method that is called the most and takes the longest time.
- Offline program snapshot: Collect the program's runtime configuration, thread dump, memory dump and other information to create a snapshot, which can be sent to developers for bug feedback.
- Endless possibilities with other plugins...

I won’t introduce the use of VisualVM in detail here. If you want to know more, you can read:

- <https://visualvm.github.io/documentation.html>
- <https://www.ibm.com/developerworks/cn/java/j-lo-visualvm/index.html>

### MAT: Memory Analyzer Tool

MAT (Memory Analyzer Tool) is a fast, convenient and powerful JVM heap memory offline analysis tool. It helps locate memory leaks or optimize large memory consumption logic by displaying the runtime heap dump snapshot (Heap dump) status recorded when the JVM is abnormal (heap dump analysis can also be done during normal running).

When encountering OOM and GC problems, I usually first use MAT to analyze dump files. This is also the scenario where this tool is most used.

For a detailed introduction to MAT, I recommend the following two articles, which are very well written:

- [In-depth explanation and practice of JVM memory analysis tool MAT—Introduction](https://juejin.cn/post/6908665391136899079)
- [In-depth explanation and practice of JVM memory analysis tool MAT—Advanced](https://juejin.cn/post/6911624328472133646)

<!-- @include: @article-footer.snippet.md -->