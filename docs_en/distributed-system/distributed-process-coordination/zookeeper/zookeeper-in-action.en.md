---
title: ZooKeeper in action
category: distributed
tag:
  - ZooKeeper
---

This article briefly demonstrates the use of common ZooKeeper commands and the basic use of ZooKeeper Java client Curator. The contents introduced are all the most basic operations, which can meet the basic needs of daily work.

If there is anything that needs to be improved or perfected in the article, please point it out in the comment area and make progress together!

## ZooKeeper installation

### Install zookeeper using Docker

**a. Download ZooKeeper using Docker**

```shell
docker pull zookeeper:3.5.8
```

**b.Run ZooKeeper**

```shell
docker run -d --name zookeeper -p 2181:2181 zookeeper:3.5.8
```

### Connect to ZooKeeper service

**a. Enter the ZooKeeper container**

First use `docker ps` to view the ContainerID of ZooKeeper, and then use the `docker exec -it ContainerID /bin/bash` command to enter the container.

**b. First enter the bin directory, and then connect to the ZooKeeper service through the `./zkCli.sh -server 127.0.0.1:2181` command**

```bash
root@eaf70fc620cb:/apache-zookeeper-3.5.8-bin# cd bin
```

If you see the following information printed out successfully on the console, it means you have successfully connected to the ZooKeeper service.

![Connect ZooKeeper service](https://oss.javaguide.cn/github/javaguide/distributed-system/zookeeper/connect-zooKeeper-service.png)

## ZooKeeper common command demonstration

### View commonly used commands (help command)

Use the `help` command to view common ZooKeeper commands

### Create node (create command)

The node1 node was created in the root directory through the `create` command, and the string associated with it is "node1"

```shell
[zk: 127.0.0.1:2181(CONNECTED) 34] create /node1 "node1"
```

The node1 node was created in the root directory through the `create` command, and the content associated with it is the number 123

```shell
[zk: 127.0.0.1:2181(CONNECTED) 1] create /node1/node1.1 123
Created /node1/node1.1
```

### Update node data content (set command)

```shell
[zk: 127.0.0.1:2181(CONNECTED) 11] set /node1 "set node1"
```

### Get node data (get command)

The `get` command can obtain the data content of the specified node and the status of the node. It can be seen that we have changed the node data content to "set node1" through the `set` command.

```shell
[zk: zookeeper(CONNECTED) 12] get -s /node1
set node1
cZxid = 0x47
ctime = Sun Jan 20 10:22:59 CST 2019
mZxid = 0x4b
mtime = Sun Jan 20 10:41:10 CST 2019
pZxid = 0x4a
cversion=1
dataVersion = 1
aclVersion = 0
ephemeralOwner = 0x0
dataLength = 9
numChildren = 1

```

### View subnodes in a directory (ls command)

Use the `ls` command to view the nodes in the root directory

```shell
[zk: 127.0.0.1:2181(CONNECTED) 37] ls /
[dubbo, ZooKeeper, node1]
```

Use the `ls` command to view the nodes in the node1 directory

```shell
[zk: 127.0.0.1:2181(CONNECTED) 5] ls /node1
[node1.1]
```

The ls command in ZooKeeper is similar to the ls command in Linux. This command will list all child node information under the absolute path path (listing level 1, not recursively)

### View node status (stat command)

Check node status through `stat` command

```shell
[zk: 127.0.0.1:2181(CONNECTED) 10] stat /node1
cZxid = 0x47
ctime = Sun Jan 20 10:22:59 CST 2019
mZxid = 0x47
mtime = Sun Jan 20 10:22:59 CST 2019
pZxid = 0x4a
cversion=1
dataVersion = 0
aclVersion = 0
ephemeralOwner = 0x0
dataLength = 11
numChildren = 1
```

Some of the information displayed above, such as cversion, aclVersion, numChildren, etc., I have already introduced in the above article "[ZooKeeper Related Concept Summary (Getting Started)](https://javaguide.cn/distributed-system/distributed-process-coordination/zookeeper/zookeeper-intro.html)".

### View node information and status (ls2 command)

The `ls2` command is more like a combination of the `ls` command and the `stat` command. The information returned by the `ls2` command includes 2 parts:

1. Child node list
2. The stat information of the current node.

```shell
[zk: 127.0.0.1:2181(CONNECTED) 7] ls2 /node1
[node1.1]
cZxid = 0x47
ctime = Sun Jan 20 10:22:59 CST 2019
mZxid = 0x47
mtime = Sun Jan 20 10:22:59 CST 2019
pZxid = 0x4a
cversion=1
dataVersion = 0
aclVersion = 0
ephemeralOwner = 0x0
dataLength = 11
numChildren = 1

```

### Delete node (delete command)

This command is very simple, but one thing to note is that if you want to delete a node, the node must have no child nodes.

```shell
[zk: 127.0.0.1:2181(CONNECTED) 3] delete /node1/node1.1
```

Later I will introduce the use of Java client API and the use of open source ZooKeeper client ZkClient and Curator.

## ZooKeeper Java client Curator is easy to use

Curator is a set of ZooKeeper Java client frameworks open sourced by Netflix. Compared with the client zookeeper that comes with Zookeeper, Curator's encapsulation is more complete, and various APIs can be used more conveniently.

![](https://oss.javaguide.cn/github/javaguide/distributed-system/zookeeper/curator.png)

Let’s briefly demonstrate the use of Curator!

Curator4.0+ version has better support for ZooKeeper 3.5.x. Before starting, please add the following dependencies to your project.

```xml
<dependency>
    <groupId>org.apache.curator</groupId>
    <artifactId>curator-framework</artifactId>
    <version>4.2.0</version>
</dependency>
<dependency>
    <groupId>org.apache.curator</groupId>
    <artifactId>curator-recipes</artifactId>
    <version>4.2.0</version>
</dependency>
```

### Connect to ZooKeeper client

Create a `CuratorFramework` object through `CuratorFrameworkFactory`, and then call the `start()` method of the `CuratorFramework` object!

```java
private static final int BASE_SLEEP_TIME = 1000;
private static final int MAX_RETRIES = 3;

// Retry strategy. Retry 3 times, and will increase the sleep time between retries.
RetryPolicy retryPolicy = new ExponentialBackoffRetry(BASE_SLEEP_TIME, MAX_RETRIES);
CuratorFramework zkClient = CuratorFrameworkFactory.builder()
    // the server to connect to (can be a server list)
    .connectString("127.0.0.1:2181")
    .retryPolicy(retryPolicy)
    .build();
zkClient.start();```

Description of some basic parameters:

- `baseSleepTimeMs`: initial time to wait between retries
- `maxRetries`: Maximum number of retries
- `connectString`: list of servers to connect to
- `retryPolicy`: retry policy

### Add, delete, modify and query data nodes

#### Create node

We introduced in [ZooKeeper Common Concepts Interpretation](./zookeeper-intro.md) that we usually divide znode into 4 major categories:

- **persistent (PERSISTENT) node**: Once created, it will always exist even if the ZooKeeper cluster goes down, until it is deleted.
- **Temporary (EPHEMERAL) node**: The life cycle of the temporary node is bound to the **client session (session)**. **The node disappears when the session disappears**. Moreover, temporary nodes **can only be used as leaf nodes** and cannot create child nodes.
- **Persistent Sequence (PERSISTENT_SEQUENTIAL) node**: In addition to the characteristics of the persistent (PERSISTENT) node, the names of child nodes are also sequential. For example `/node1/app0000000001`, `/node1/app0000000002`.
- **Temporary Sequential (EPHEMERAL_SEQUENTIAL) Node**: In addition to having the characteristics of temporary (EPHEMERAL) nodes, the names of child nodes are also sequential.

When you use ZooKeeper, you will find that there are actually 7 znode types in the `CreateMode` class, but the 4 types introduced above are the most used.

**a.Create persistence node**

You can create persistent nodes in the following two ways.

```java
//Note: The following code will report an error. The specific reasons are explained below.
zkClient.create().forPath("/node1/00001");
zkClient.create().withMode(CreateMode.PERSISTENT).forPath("/node1/00002");
```

However, you will get an error when you run the above code. This is because the parent node `node1` has not been created yet.

You can create the parent node `node1` first, and then execute the above code without error.

```java
zkClient.create().forPath("/node1");
```

The more recommended way is to use the following line of code, **`creatingParentsIfNeeded()` can ensure that the parent node is automatically created when the parent node does not exist, which is very useful. **

```java
zkClient.create().creatingParentsIfNeeded().withMode(CreateMode.PERSISTENT).forPath("/node1/00001");
```

**b. Create temporary nodes**

```java
zkClient.create().creatingParentsIfNeeded().withMode(CreateMode.EPHEMERAL).forPath("/node1/00001");
```

**c. Create nodes and specify data content**

```java
zkClient.create().creatingParentsIfNeeded().withMode(CreateMode.EPHEMERAL).forPath("/node1/00001","java".getBytes());
zkClient.getData().forPath("/node1/00001");//Get the data content of the node, and get the byte array
```

**d. Check whether the node is created successfully**

```java
zkClient.checkExists().forPath("/node1/00001");//If it is not null, it means the node was created successfully
```

#### Delete node

**a.Delete a child node**

```java
zkClient.delete().forPath("/node1/00001");
```

**b. Delete a node and all its child nodes**

```java
zkClient.delete().deletingChildrenIfNeeded().forPath("/node1");
```

#### Get/update node data content

```java
zkClient.create().creatingParentsIfNeeded().withMode(CreateMode.EPHEMERAL).forPath("/node1/00001","java".getBytes());
zkClient.getData().forPath("/node1/00001");//Get the data content of the node
zkClient.setData().forPath("/node1/00001","c++".getBytes());//Update node data content
```

#### Get the paths of all child nodes of a node

```java
List<String> childrenPaths = zkClient.getChildren().forPath("/node1");
```

<!-- @include: @article-footer.snippet.md -->