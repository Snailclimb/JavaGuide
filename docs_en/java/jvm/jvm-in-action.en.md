---
title: JVM online troubleshooting and performance tuning cases
category: Java
tag:
  - JVM
head:
  - - meta
    - name: keywords
      content: JVM practice, online troubleshooting, performance tuning, memory analysis, GC optimization, tools
  - - meta
    - name: description
      content: A collection of JVM troubleshooting and optimization cases in production, covering memory, GC, tool usage, etc.
---

JVM online troubleshooting and performance tuning is also a question often asked in interviews, especially interviews with large social recruitment companies.

In this article, I will share some relevant cases that I have seen.

Below is the text.

[Analysis of an online OOM problem - Ai Xiaoxian - 2023](https://juejin.cn/post/7205141492264976445)

- **Phenomena**: An online service has an interface that is very slow. By monitoring the link, it is found that the gap time in the middle is very large. The actual interface does not consume a lot of time, and there are many such requests during that time.
- **Analysis**: Use the `jvisualvm` that comes with the JDK to analyze the dump file (MAT can also analyze it).
- **Recommendation**: For SQL statements, if a full table query without a `where` condition is detected, an appropriate `limit` should be added by default as a limit to prevent this problem from bringing down the entire system.
- **Information**: [Practical case: Record a dump file analysis process and reprint it - HeapDump - 2022](https://heapdump.cn/article/3489050).

[Production accident - remember a special OOM troubleshooting - Cheng Yu Youyun - 2023](https://www.cnblogs.com/mylibs/p/production-accident-0002.html)

- **Phenomenon**: When there is no problem with the network, an open interface of the system will become inaccessible and unusable starting from around 14:00 on March 10, 2023.
- **Temporary workaround**: Emergency rollback to the previous stable version.
- **Analysis**: Use the MAT (Memory Analyzer Tool) tool to analyze the dump file.
- **Recommendation**: Under normal circumstances, the `-Xmn` parameter (controlling the size of the Young area) should always be smaller than the `-Xmx` parameter (controlling the maximum size of the heap memory), otherwise an OOM error will be triggered.
- **Information**: [Summary of the most important JVM parameters - JavaGuide - 2023](https://javaguide.cn/java/jvm/jvm-parameters-intro.html)

[Troubleshooting analysis of a large number of JVM Native memory leaks (64M problem) - Nuggets - 2022](https://juejin.cn/post/7078624931826794503)

- **Phenomenon**: Just after starting the online project, use the top command to check that RES occupies more than 1.5G.
- **Analysis**: The entire analysis process requires a lot of work. You can follow the author's ideas step by step. It is worth learning and reference.
- **Advice**: Stay away from Hibernate.
- **Information**: [Memory-related fields (VIRT, RES, SHR, CODE, DATA) in the Linux top command](https://liam.page/2020/07/17/memory-stat-in-TOP/)

[YGC troubleshooting made me stand out again! - Career advancement for IT people - 2021](https://www.heapdump.cn/article/1661497)

- **Phenomenon**: After the new version was launched, the advertising service received a large number of service timeout alarms.
- **Analysis**: Use the MAT (Memory Analyzer Tool) tool to analyze the dump file.
- **Suggestion**: Learn how to troubleshoot YGC (Young GC) problems and master YGC-related knowledge points.

[I heard that JVM performance optimization is difficult? I gave it a try today! - Chen Shuyi - 2021](https://shuyi.tech/archives/have-a-try-in-jvm-combat)

By observing the GC frequency and pause time, adjust the JVM memory space to achieve the most reasonable state. Remember to take small steps during the adjustment process to avoid severe memory fluctuations that may affect online services. This is actually the simplest method of JVM performance tuning, and it can be regarded as rough tuning.

[The online GC problem case you want is here - compiled a program - 2021](https://mp.weixin.qq.com/s/df1uxHWUXzhErxW1sZ6OvQ)

- **Case 1**: When using guava cache, the maximum number of caches and weak references are not set, resulting in frequent triggering of Young GC.
- **Case 2**: For a query and sorting paging SQL, and this SQL needs to join multiple tables, under the sub-database and sub-table, the performance of directly calling SQL is very poor. Therefore, we looked up the order table, then sorted and paged the data in the memory, and used a List to save the data. However, some data were large in size, which caused this phenomenon.

[Analysis and solutions to 9 common CMS GC problems in Java - Meituan Technology Group - 2020](https://tech.meituan.com/2020/11/12/java-9-cms-gc.html)

This article has a total of 2w+ words. It introduces the basics of GC in detail and summarizes the analysis and solutions of some common problems of CMS GC.

[Made some GC tuning for the ancestral system, reducing the pause time by 90% - JD Cloud Technical Team - 2023](https://juejin.cn/post/7311623433817571365)

This article mentions a GC (garbage collection) problem encountered in the rule engine system, which is mainly manifested as a long Young GC (young generation garbage collection) after the system is started, resulting in performance degradation. After analysis, the core of the problem lies in the dynamic object age determination mechanism, which leads to premature object promotion and long-term garbage collection.

<!-- @include: @article-footer.snippet.md -->