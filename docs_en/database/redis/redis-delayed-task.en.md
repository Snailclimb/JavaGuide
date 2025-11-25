---
title: How to implement delayed tasks based on Redis
category: database
tag:
  - Redis
head:
  - - meta
    - name: keywords
      content: Redis, delayed tasks, expiration events, Redisson, DelayedQueue, reliability, consistency
  - - meta
    - name: description
      content: Compare the two solutions of Redis expiration event and Redisson delay queue, analyze the trade-off between reliability and consistency, and give project selection suggestions.
---

The function of implementing delayed tasks based on Redis is nothing more than the following two options:

1. Redis expiration event monitoring
2. Redisson’s built-in delay queue

During the interview, you can first say that you have considered these two solutions, but in the end you found that there are many problems with the Redis expiration event monitoring solution, so you finally chose the DelayedQueue solution built into Redisson.

At this time, the interviewer may ask you some relevant questions, which we will mention later, so just prepare in advance.

In addition, in addition to the questions introduced below, it is recommended that you review all the common questions related to Redis. It is not ruled out that the interviewer will ask you some other questions about Redis.

### How does Redis expiration event monitoring implement the delayed task function?

Redis 2.0 introduces publish and subscribe (pub/sub) functionality. In pub/sub, a concept called channel is introduced, which is somewhat similar to topic in message queue.

Pub/sub involves two roles: publisher (publisher) and subscriber (subscriber, also called consumer):

- The publisher delivers messages to the specified channel through `PUBLISH`.
- Subscribers subscribe to the channels they care about through `SUBSCRIBE`. Moreover, subscribers can subscribe to one or multiple channels.

![Redis publish and subscribe (pub/sub) function](https://oss.javaguide.cn/github/javaguide/database/redis/redis-pub-sub.png)

In the pub/sub mode, the producer needs to specify which channel to send the message to, and the consumer subscribes to the corresponding channel to obtain the message.

There are many default channels in Redis, and these channels are sent to them by Redis itself, not by the code we write ourselves. Among them, `__keyevent@0__:expired` is a default channel, responsible for monitoring key expiration events. That is to say, when a key expires, Redis will publish a key expiration event to the channel `__keyevent@<db>__:expired`.

We only need to listen to this channel to get the information about the expired key, thereby realizing the delayed task function.

This function is officially called **keyspace notifications** by Redis, and its function is to monitor changes in Redis keys and values ​​in real time.

### What are the shortcomings of Redis expiration event monitoring to implement the delayed task function?

**1. Poor timeliness**

An introduction in the official document explains the reason for poor timeliness, address: <https://redis.io/docs/manual/keyspace-notifications/#timing-of-expired-events>.

![Redis expiration events](https://oss.javaguide.cn/github/javaguide/database/redis/redis-timing-of-expired-events.png)

The core of this paragraph is: the expiration event message is published when the Redis server deletes the key, instead of being published directly after a key expires.

We know that there are two commonly used deletion strategies for expired data:

1. **Lazy deletion**: The data will only be checked for expiration when the key is taken out. This is the most CPU-friendly, but may cause too many expired keys to be deleted.
2. **Periodic deletion**: Extract a batch of keys at regular intervals to delete expired keys. Moreover, the Redis underlying layer will reduce the impact of deletion operations on CPU time by limiting the duration and frequency of deletion operations.

Periodic deletion is more memory friendly, lazy deletion is more CPU friendly. Both have their own merits, so Redis uses **regular deletion + lazy/lazy deletion**.

Therefore, there will be situations where I set the expiration time of the key, but the key has not been deleted by the specified time, and no expiration event is released.

**2. Lost message**

Messages in Redis's pub/sub mode do not support persistence, unlike message queues. In the pub/sub mode of Redis, the publisher sends the message to the specified channel, and the subscriber listens to the corresponding channel to receive the message. When there are no subscribers, the message will be discarded directly and will not be stored in Redis.

**3. Repeated consumption of messages under multiple service instances**

Redis's pub/sub mode currently only has a broadcast mode, which means that when a producer publishes a message to a specific channel, all consumers subscribed to the relevant channel can receive the message.

At this time, we need to pay attention to the problem of multiple service instances repeatedly processing messages, which will increase the amount of code development and maintenance difficulty.

### What is the principle of Redisson delay queue? What are the advantages?

Redisson is an open source Java language Redis client that provides many out-of-the-box features, such as the implementation of multiple distributed locks and delay queues.

We can use Redisson's built-in delay queue RDelayedQueue to implement the delayed task function.

Redisson's delay queue RDelayedQueue is implemented based on Redis' SortedSet. SortedSet is an ordered set in which each element can be set with a score, representing the weight of the element. Redisson takes advantage of this feature to insert tasks that need to be delayed into a SortedSet and set corresponding expiration times as scores for them.

Redisson periodically scans the SortedSet for expired elements using the `zrangebyscore` command, then removes these expired elements from the SortedSet and adds them to the ready message list. The ready message list is a blocking queue, and when a message comes in, it will be monitored by the consumer. This avoids the consumer polling the entire SortedSet and improves execution efficiency.

Compared with Redis expiration event monitoring to implement delayed task function, this method has the following advantages:

1. **Reduces the possibility of message loss**: Messages in DelayedQueue will be persisted. Even if Redis is down, only a few messages may be lost according to the persistence mechanism, which will have little impact. Of course, you can also use database scanning as a compensation mechanism.
2. **There is no problem of repeated consumption of messages**: Each client obtains tasks from the same target queue, and there is no problem of repeated consumption.

Compared with Redisson's built-in delay queue, the message queue can achieve higher throughput and stronger reliability by ensuring the reliability of message consumption and controlling the number of message producers and consumers. In actual projects, the delayed message solution of the message queue is preferred.