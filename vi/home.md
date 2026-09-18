---
icon: "mdi:head-lightbulb-outline"
title: Hướng dẫn phỏng vấn Java (Tổng hợp câu hỏi phỏng vấn backend của JavaGuide)
description: Hướng dẫn phỏng vấn Java của JavaGuide, tổng hợp có hệ thống lý thuyết và câu hỏi phỏng vấn backend, bao phủ Java Basics, Collection, Concurrency, JVM, Spring, MySQL, Redis, system design và distributed, phù hợp cho ôn tập tuyển dụng sinh viên và tuyển dụng có kinh nghiệm.
sitemap:
  changefreq: weekly
  priority: 1
head:
  - - meta
    - name: keywords
      content: phỏng vấn Java,hướng dẫn phỏng vấn Java,lý thuyết phỏng vấn Java,câu hỏi phỏng vấn Java,phỏng vấn Java Basics,phỏng vấn JVM,phỏng vấn concurrency,phỏng vấn thread pool,phỏng vấn Spring,phỏng vấn MySQL,phỏng vấn Redis,phỏng vấn system design,phỏng vấn distributed,phỏng vấn backend
---

<!-- @include: @small-advertisement.snippet.md -->

<!-- markdownlint-disable MD024 -->

JavaGuide là bộ **hướng dẫn phỏng vấn Java** và **tài liệu ôn tập phỏng vấn backend** có hệ thống, nội dung bao phủ các điểm kiến thức cốt lõi như Java Basics, Collection, concurrent programming, JVM, Spring/Spring Boot, MySQL, Redis, distributed, high concurrency, high availability và system design.

Nếu bạn đang chuẩn bị phỏng vấn tuyển dụng sinh viên, tuyển dụng có kinh nghiệm hoặc nhảy việc, hãy bắt đầu từ [Kế hoạch vượt qua phỏng vấn Java backend](./interview-preparation/backend-interview-plan.md), rồi ôn dần các câu hỏi phỏng vấn Java và backend tần suất cao theo từng module bên dưới.

Toàn bộ nội dung website đã được mã nguồn mở miễn phí, hoan nghênh cùng [duy trì và hoàn thiện](http://localhost:8080/javaguide/contribution-guideline.html), nếu thấy hữu ích thì hoan nghênh Star!

- **Địa chỉ project**: <https://github.com/Snailclimb/JavaGuide>
- **Đọc online**: <https://javaguide.cn/>

## Tài liệu mở rộng

- [Project mã nguồn mở Java chất lượng](./open-source-project/): tuyển chọn các project Java mã nguồn mở trên Gitee/GitHub phù hợp để học, thực chiến và ghi vào CV.
- [Gợi ý sách kỹ thuật chất lượng](./books/): bao phủ các hướng computer science cơ bản, database, search engine, distributed system, kiến trúc high availability.

## Chuẩn bị phỏng vấn

- [⭐ Kế hoạch vượt qua phỏng vấn Java backend (bao phủ hệ thống backend chung)](./interview-preparation/backend-interview-plan.md) (nhất định phải xem :+1:)
- [Chuẩn bị phỏng vấn Java hiệu quả thế nào?](./interview-preparation/teach-you-how-to-prepare-for-the-interview-hand-in-hand.md)
- [Tổng hợp trọng điểm phỏng vấn Java backend](./interview-preparation/key-points-of-interview.md)
- [Lộ trình học Java (bản mới nhất, 4w+ chữ)](./interview-preparation/java-roadmap.md)
- [Hướng dẫn viết CV cho lập trình viên](./interview-preparation/resume-guide.md)
- [Hướng dẫn về kinh nghiệm project](./interview-preparation/project-experience-guide.md)
- [Phỏng vấn quá căng thẳng thì làm sao?](./interview-preparation/how-to-handle-interview-nerves.md)
- [Tuyển dụng sinh viên mà không có kinh nghiệm thực tập thì sao? Viết kinh nghiệm thực tập thế nào?](./interview-preparation/internship-experience.md)

## Java

### Basics

**Tổng hợp điểm kiến thức/câu hỏi phỏng vấn**: (bắt buộc xem :+1:)

- [Tổng hợp điểm kiến thức & câu hỏi phỏng vấn Java Basics thường gặp (phần 1)](./java/basis/java-basic-questions-01.md)
- [Tổng hợp điểm kiến thức & câu hỏi phỏng vấn Java Basics thường gặp (phần 2)](./java/basis/java-basic-questions-02.md)
- [Tổng hợp điểm kiến thức & câu hỏi phỏng vấn Java Basics thường gặp (phần 3)](./java/basis/java-basic-questions-03.md)

**Giải thích chi tiết các điểm kiến thức quan trọng**:

- [Tại sao Java chỉ có pass by value?](./java/basis/why-there-only-value-passing-in-java.md)
- [Giải thích chi tiết Java serialization](./java/basis/serialization.md)
- [Giải thích chi tiết generic & wildcard](./java/basis/generics-and-wildcards.md)
- [Giải thích chi tiết cơ chế reflection của Java](./java/basis/reflection.md)
- [Giải thích chi tiết proxy pattern trong Java](./java/basis/proxy.md)
- [Giải thích chi tiết BigDecimal](./java/basis/bigdecimal.md)
- [Giải thích chi tiết class "ma thuật" Unsafe của Java](./java/basis/unsafe.md)
- [Giải thích chi tiết cơ chế Java SPI](./java/basis/spi.md)
- [Giải thích chi tiết syntactic sugar trong Java](./java/basis/syntactic-sugar.md)

### Collection

**Tổng hợp điểm kiến thức/câu hỏi phỏng vấn**:

- [Tổng hợp điểm kiến thức & câu hỏi phỏng vấn Java Collection thường gặp (phần 1)](./java/collection/java-collection-questions-01.md) (bắt buộc xem :+1:)
- [Tổng hợp điểm kiến thức & câu hỏi phỏng vấn Java Collection thường gặp (phần 2)](./java/collection/java-collection-questions-02.md) (bắt buộc xem :+1:)
- [Tổng hợp lưu ý khi sử dụng Java Collection](./java/collection/java-collection-precautions-for-use.md)

**Phân tích source code**:

- [Source code cốt lõi ArrayList + phân tích cơ chế resize](./java/collection/arraylist-source-code.md)
- [Phân tích source code cốt lõi LinkedList](./java/collection/linkedlist-source-code.md)
- [Source code cốt lõi HashMap + phân tích cấu trúc dữ liệu bên trong](./java/collection/hashmap-source-code.md)
- [Source code cốt lõi ConcurrentHashMap + phân tích cấu trúc dữ liệu bên trong](./java/collection/concurrent-hash-map-source-code.md)
- [Phân tích source code cốt lõi LinkedHashMap](./java/collection/linkedhashmap-source-code.md)
- [Phân tích source code cốt lõi CopyOnWriteArrayList](./java/collection/copyonwritearraylist-source-code.md)
- [Phân tích source code cốt lõi ArrayBlockingQueue](./java/collection/arrayblockingqueue-source-code.md)
- [Phân tích source code cốt lõi PriorityQueue](./java/collection/priorityqueue-source-code.md)
- [Phân tích source code cốt lõi DelayQueue](./java/collection/priorityqueue-source-code.md)

### IO

- [Tổng hợp kiến thức cơ bản về IO](./java/io/io-basis.md)
- [Tổng hợp design pattern trong IO](./java/io/io-design-patterns.md)
- [Giải thích chi tiết các IO model](./java/io/io-model.md)
- [Tổng hợp kiến thức cốt lõi NIO](./java/io/nio-basis.md)

### Concurrency

**Tổng hợp điểm kiến thức/câu hỏi phỏng vấn**: (bắt buộc xem :+1:)

- [Tổng hợp điểm kiến thức & câu hỏi phỏng vấn Java Concurrency thường gặp (phần 1)](./java/concurrent/java-concurrent-questions-01.md)
- [Tổng hợp điểm kiến thức & câu hỏi phỏng vấn Java Concurrency thường gặp (phần 2)](./java/concurrent/java-concurrent-questions-02.md)
- [Tổng hợp điểm kiến thức & câu hỏi phỏng vấn Java Concurrency thường gặp (phần 3)](./java/concurrent/java-concurrent-questions-03.md)

**Giải thích chi tiết các điểm kiến thức quan trọng**:

- [Giải thích chi tiết optimistic lock và pessimistic lock](./java/concurrent/optimistic-lock-and-pessimistic-lock.md)
- [Giải thích chi tiết CAS](./java/concurrent/cas.md)
- [Giải thích chi tiết JMM (Java Memory Model)](./java/concurrent/jmm.md)
- **Thread pool**: [Giải thích chi tiết Java thread pool](./java/concurrent/java-thread-pool-summary.md), [Best practice cho Java thread pool](./java/concurrent/java-thread-pool-best-practices.md)
- [Giải thích chi tiết ThreadLocal](./java/concurrent/threadlocal.md)
- [Tổng hợp concurrent collection trong Java](./java/concurrent/java-concurrent-collections.md)
- [Tổng hợp các Atomic class](./java/concurrent/atomic-classes.md)
- [Giải thích chi tiết AQS](./java/concurrent/aqs.md)
- [Giải thích chi tiết CompletableFuture](./java/concurrent/completablefuture-intro.md)

### JVM (bắt buộc xem :+1:)

Phần JVM này chủ yếu tham khảo [JVM Specification - Java 8](https://docs.oracle.com/javase/specs/jvms/se8/html/index.html) và cuốn [《Hiểu sâu về Java Virtual Machine (phiên bản 3)》](https://book.douban.com/subject/34907497/) của thầy Chu Chí Minh (rất khuyến khích đọc nhiều lần!).

- **[⭐ Tổng hợp câu hỏi phỏng vấn JVM thường gặp](./java/jvm/jvm-interview-questions.md)**
- **[Vùng nhớ Java](./java/jvm/memory-area.md)**
- **[Garbage collection trong JVM](./java/jvm/jvm-garbage-collection.md)**
- [Cấu trúc file class](./java/jvm/class-file-structure.md)
- **[Quá trình class loading](./java/jvm/class-loading-process.md)**
- [Class loader](./java/jvm/classloader.md)
- [【Chưa hoàn thành】Tổng hợp các JVM parameter quan trọng nhất (đã dịch xong một nửa)](./java/jvm/jvm-parameters-intro.md)
- [【Bổ sung】Hiểu JVM bằng ngôn ngữ đời thường](./java/jvm/jvm-intro.md)
- [Công cụ giám sát và xử lý sự cố của JDK](./java/jvm/jdk-monitoring-and-troubleshooting-tools.md)

### Tính năng mới

- **Java 8**: [Tổng hợp tính năng mới Java 8 (bản dịch)](./java/new-features/java8-tutorial-translate.md), [Tổng hợp tính năng mới thường dùng của Java 8](./java/new-features/java8-common-new-features.md)
- [Tổng quan tính năng mới Java 9](./java/new-features/java9.md)
- [Tổng quan tính năng mới Java 10](./java/new-features/java10.md)
- [Tổng quan tính năng mới Java 11](./java/new-features/java11.md)
- [Tổng quan tính năng mới Java 12 & 13](./java/new-features/java12-13.md)
- [Tổng quan tính năng mới Java 14 & 15](./java/new-features/java14-15.md)
- [Tổng quan tính năng mới Java 16](./java/new-features/java16.md)
- [Tổng quan tính năng mới Java 17](./java/new-features/java17.md)
- [Tổng quan tính năng mới Java 18](./java/new-features/java18.md)
- [Tổng quan tính năng mới Java 19](./java/new-features/java19.md)
- [Tổng quan tính năng mới Java 20](./java/new-features/java20.md)
- [Tổng quan tính năng mới Java 21](./java/new-features/java21.md)
- [Tổng quan tính năng mới Java 22 & 23](./java/new-features/java22-23.md)
- [Tổng quan tính năng mới Java 24](./java/new-features/java24.md)
- [Tổng quan tính năng mới Java 25](./java/new-features/java25.md)

## Computer science cơ bản

> Phần computer science cơ bản (computer network, operating system, data structure và algorithm) đã tách thành module riêng, xem tại [Tổng hợp kiến thức computer science cơ bản](./cs-basics/).

[![Banner](https://oss.javaguide.cn/xingqiu/xingqiu.png)](./about-the-author/zhishixingqiu-two-years.md)

## Database

### Cơ bản

- [Tổng hợp kiến thức cơ bản về database](./database/basis.md)
- [Tổng hợp kiến thức cơ bản về NoSQL](./database/nosql.md)
- [Giải thích chi tiết character set](./database/character-set.md)
- SQL:
  - [Tổng hợp kiến thức cơ bản về cú pháp SQL](./database/sql/sql-syntax-summary.md)
  - [Tổng hợp câu hỏi phỏng vấn SQL thường gặp](./database/sql/sql-questions-01.md)

### MySQL

**Tổng hợp điểm kiến thức/câu hỏi phỏng vấn:**

- **[Tổng hợp điểm kiến thức & câu hỏi phỏng vấn MySQL thường gặp](./database/mysql/mysql-questions-01.md)** (bắt buộc xem :+1:)
- [Tổng hợp quy tắc tối ưu hiệu năng cao cho MySQL](./database/mysql/mysql-high-performance-optimization-specification-recommendations.md)

**Điểm kiến thức quan trọng:**

- [Giải thích chi tiết index trong MySQL](./database/mysql/mysql-index.md)
- [Tổng hợp các tình huống index MySQL mất tác dụng](./database/mysql/mysql-index-invalidation.md)
- [Giải thích chi tiết isolation level của transaction MySQL kèm hình ảnh](./database/mysql/transaction-isolation-level.md)
- [Giải thích chi tiết ba loại log của MySQL (binlog, redo log và undo log)](./database/mysql/mysql-logs.md)
- [Cách storage engine InnoDB hiện thực MVCC](./database/mysql/innodb-implementation-of-mvcc.md)
- [Quá trình thực thi câu lệnh SQL trong MySQL](./database/mysql/how-sql-executed-in-mysql.md)
- [Giải thích chi tiết query cache của MySQL](./database/mysql/mysql-query-cache.md)
- [Phân tích execution plan của MySQL](./database/mysql/mysql-query-execution-plan.md)
- [Primary key tự tăng của MySQL có chắc chắn liên tục không](./database/mysql/mysql-auto-increment-primary-key-continuous.md)
- [Gợi ý lưu trữ dữ liệu kiểu thời gian trong MySQL](./database/mysql/some-thoughts-on-database-storage-time.md)
- [Implicit conversion trong MySQL gây mất tác dụng index](./database/mysql/index-invalidation-caused-by-implicit-conversion.md)

### Redis

**Tổng hợp điểm kiến thức/câu hỏi phỏng vấn**: (bắt buộc xem :+1:)

- [Tổng hợp điểm kiến thức & câu hỏi phỏng vấn Redis thường gặp (phần 1)](./database/redis/redis-questions-01.md)
- [Tổng hợp điểm kiến thức & câu hỏi phỏng vấn Redis thường gặp (phần 2)](./database/redis/redis-questions-02.md)

**Điểm kiến thức quan trọng:**

- [Giải thích chi tiết 3 chiến lược đọc/ghi cache thường dùng](./database/redis/3-commonly-used-cache-read-and-write-strategies.md)
- [Redis có làm được message queue không? Hiện thực thế nào?](./database/redis/redis-stream-mq.md)
- [Giải thích chi tiết 5 cấu trúc dữ liệu cơ bản của Redis](./database/redis/redis-data-structures-01.md)
- [Giải thích chi tiết 3 cấu trúc dữ liệu đặc biệt của Redis](./database/redis/redis-data-structures-02.md)
- [Giải thích chi tiết cơ chế persistence của Redis](./database/redis/redis-persistence.md)
- [Giải thích chi tiết memory fragmentation trong Redis](./database/redis/redis-memory-fragmentation.md)
- [Tổng hợp các nguyên nhân gây blocking thường gặp trong Redis](./database/redis/redis-common-blocking-problems-summary.md)
- [Giải thích chi tiết Redis cluster](./database/redis/redis-cluster.md)

### MongoDB

- [Tổng hợp điểm kiến thức & câu hỏi phỏng vấn MongoDB thường gặp (phần 1)](./database/mongodb/mongodb-questions-01.md)
- [Tổng hợp điểm kiến thức & câu hỏi phỏng vấn MongoDB thường gặp (phần 2)](./database/mongodb/mongodb-questions-02.md)

## Search engine

[Tổng hợp câu hỏi phỏng vấn Elasticsearch thường gặp (trả phí)](./database/elasticsearch/elasticsearch-questions-01.md)

![Tài khoản công khai JavaGuide](https://oss.javaguide.cn/github/javaguide/gongzhonghaoxuanchuan.png)

## Công cụ phát triển

### Maven

- [Tổng hợp khái niệm cốt lõi của Maven](./tools/maven/maven-core-concepts.md)
- [Best practice cho Maven](./tools/maven/maven-best-practices.md)

### Gradle

[Tổng hợp khái niệm cốt lõi của Gradle](./tools/gradle/gradle-core-concepts.md) (tùy chọn, hiện tại ở Trung Quốc Maven vẫn phổ biến hơn)

### Docker

- [Tổng hợp khái niệm cốt lõi của Docker](./tools/docker/docker-intro.md)
- [Docker thực chiến](./tools/docker/docker-in-action.md)

### Git

- [Tổng hợp khái niệm cốt lõi của Git](./tools/git/git-intro.md)
- [Tổng hợp mẹo hữu ích khi dùng GitHub](./tools/git/github-tips.md)

## System design

- [⭐ Tổng hợp câu hỏi phỏng vấn system design thường gặp](./system-design/system-design-questions.md)
- [⭐ Tổng hợp câu hỏi phỏng vấn design pattern thường gặp](https://interview.javaguide.cn/system-design/design-pattern.html)

### Cơ bản

- [Hướng dẫn ngắn gọn về RESTful API](./system-design/basis/RESTfulAPI.md)
- [Giáo trình ngắn gọn về software engineering](./system-design/basis/software-engineering.md)
- [Hướng dẫn đặt tên trong code](./system-design/basis/naming.md)
- [Hướng dẫn refactor code](./system-design/basis/refactoring.md)
- [Hướng dẫn unit test](./system-design/basis/unit-test.md)

### Framework thường dùng

#### Spring/SpringBoot (bắt buộc xem :+1:)

**Tổng hợp điểm kiến thức/câu hỏi phỏng vấn**:

- [Tổng hợp điểm kiến thức & câu hỏi phỏng vấn Spring thường gặp](./system-design/framework/spring/spring-knowledge-and-questions-summary.md)
- [Tổng hợp điểm kiến thức & câu hỏi phỏng vấn SpringBoot thường gặp](./system-design/framework/spring/springboot-knowledge-and-questions-summary.md)
- [Tổng hợp các annotation thường dùng của Spring/Spring Boot](./system-design/framework/spring/spring-common-annotations.md)
- [Hướng dẫn nhập môn SpringBoot](https://github.com/Snailclimb/springboot-guide)

**Giải thích chi tiết các điểm kiến thức quan trọng**:

- [Giải thích chi tiết IoC & AOP (hiểu nhanh)](./system-design/framework/spring/ioc-and-aop.md)
- [Giải thích chi tiết transaction trong Spring](./system-design/framework/spring/spring-transaction.md)
- [Giải thích chi tiết các design pattern trong Spring](./system-design/framework/spring/spring-design-patterns-summary.md)
- [Giải thích chi tiết nguyên lý auto configuration của SpringBoot](./system-design/framework/spring/spring-boot-auto-assembly-principles.md)

#### MyBatis

[Tổng hợp câu hỏi phỏng vấn MyBatis thường gặp](./system-design/framework/mybatis/mybatis-interview.md)

### Security

#### Authentication & authorization

- [Giải thích chi tiết khái niệm cơ bản về authentication và authorization](./system-design/security/basis-of-authority-certification.md)
- [Giải thích chi tiết khái niệm cơ bản về JWT](./system-design/security/jwt-intro.md)
- [Phân tích ưu/nhược điểm của JWT và giải pháp cho các vấn đề thường gặp](./system-design/security/advantages-and-disadvantages-of-jwt.md)
- [Giải thích chi tiết SSO (Single Sign-On)](./system-design/security/sso-intro.md)
- [Giải thích chi tiết thiết kế hệ thống phân quyền](./system-design/security/design-of-authority-system.md)

#### An toàn dữ liệu

- [Tổng hợp các thuật toán mã hóa thường gặp](./system-design/security/encryption-algorithms.md)
- [Tổng hợp giải pháp lọc từ nhạy cảm](./system-design/security/sentive-words-filter.md)
- [Tổng hợp giải pháp che giấu dữ liệu (data desensitization)](./system-design/security/data-desensitization.md)
- [Tại sao cả frontend và backend đều phải validate dữ liệu](./system-design/security/data-validation.md)
- [Tại sao khi quên mật khẩu chỉ có thể reset chứ không cho biết mật khẩu cũ?](./system-design/security/why-password-reset-instead-of-retrieval.md)

### Scheduled task

[Giải thích chi tiết scheduled task trong Java](./system-design/schedule-task.md)

### Đẩy tin nhắn real-time trên Web

[Giải thích chi tiết việc đẩy tin nhắn real-time trên Web](./system-design/web-real-time-message-push.md)

## Distributed

- [⭐ Câu hỏi phỏng vấn distributed tần suất cao](https://interview.javaguide.cn/distributed-system/distributed-system.html)
- [Chuẩn bị phỏng vấn distributed system](./distributed-system/distributed-system-interview-questions.md)
- [Chuẩn bị phỏng vấn microservice](./distributed-system/microservices-interview-questions.md)
- [Nhập môn distributed system](./distributed-system/distributed-system-intro.md)

### Lý thuyết & thuật toán & giao thức

- [Phân tích lý thuyết CAP và lý thuyết BASE](./distributed-system/protocol/cap-and-base-theorem.md)
- [Giải thích chi tiết về distributed coordination](./distributed-system/protocol/centralized-and-decentralized.md)
- [Giải thích chi tiết bài toán Byzantine Generals](./distributed-system/protocol/byzantine-generals-problem.md)
- [Phân tích thuật toán Paxos](./distributed-system/protocol/paxos-algorithm.md)
- [Phân tích thuật toán Raft](./distributed-system/protocol/raft-algorithm.md)
- [Phân tích giao thức ZAB](./distributed-system/protocol/zab.md)
- [Giải thích chi tiết giao thức Gossip](./distributed-system/protocol/gossip-protocol.md)
- [Giải thích chi tiết thuật toán consistent hashing](./distributed-system/protocol/consistent-hashing.md)

### RPC

- [Tổng hợp kiến thức cơ bản về RPC](./distributed-system/rpc/rpc-intro.md)
- [Tổng hợp điểm kiến thức & câu hỏi phỏng vấn Dubbo thường gặp](./distributed-system/rpc/dubbo.md)

### ZooKeeper

> Hai bài này có thể trùng lặp nội dung một phần, khuyến khích đọc cả hai.

- [Tổng hợp khái niệm liên quan đến ZooKeeper (nhập môn)](./distributed-system/distributed-process-coordination/zookeeper/zookeeper-intro.md)
- [Tổng hợp khái niệm liên quan đến ZooKeeper (nâng cao)](./distributed-system/distributed-process-coordination/zookeeper/zookeeper-plus.md)

### API Gateway

- [Tổng hợp kiến thức cơ bản về API gateway](./distributed-system/api-gateway.md)
- [Tổng hợp điểm kiến thức & câu hỏi phỏng vấn Spring Cloud Gateway thường gặp](./distributed-system/spring-cloud-gateway-questions.md)

### Distributed ID

- [Tổng hợp điểm kiến thức & câu hỏi phỏng vấn distributed ID thường gặp](./distributed-system/distributed-id.md)
- [Hướng dẫn thiết kế distributed ID](./distributed-system/distributed-id-design.md)

### Distributed lock

- [Giới thiệu distributed lock](https://javaguide.cn/distributed-system/distributed-lock.html)
- [Tổng hợp các giải pháp hiện thực distributed lock thường gặp](https://javaguide.cn/distributed-system/distributed-lock-implementations.html)

### Distributed transaction

[Tổng hợp điểm kiến thức & câu hỏi phỏng vấn distributed transaction thường gặp](./distributed-system/distributed-transaction.md)

### Distributed configuration center

[Tổng hợp điểm kiến thức & câu hỏi phỏng vấn distributed configuration center thường gặp](./distributed-system/distributed-configuration-center.md)

## High performance

### Tối ưu database

- [Read/write splitting và sharding trong database](./high-performance/read-and-write-separation-and-library-subtable.md)
- [Tách dữ liệu nóng/lạnh](./high-performance/data-cold-hot-separation.md)
- [Tổng hợp các cách tối ưu SQL thường gặp](./high-performance/sql-optimization.md)
- [Giới thiệu deep pagination và gợi ý tối ưu](./high-performance/deep-pagination-optimization.md)

### Load balancing

[Tổng hợp điểm kiến thức & câu hỏi phỏng vấn load balancing thường gặp](./high-performance/load-balancing.md)

### CDN

[Tổng hợp điểm kiến thức & câu hỏi phỏng vấn CDN (Content Delivery Network) thường gặp](./high-performance/cdn.md)

### Message queue

- [Chuẩn bị phỏng vấn message queue](./high-performance/message-queue/message-queue-interview-questions.md)
- [Tổng hợp kiến thức cơ bản về message queue](./high-performance/message-queue/message-queue.md)
- [Tổng hợp điểm kiến thức & câu hỏi phỏng vấn Disruptor thường gặp](./high-performance/message-queue/disruptor-questions.md)
- [Tổng hợp điểm kiến thức & câu hỏi phỏng vấn RabbitMQ thường gặp](./high-performance/message-queue/rabbitmq-questions.md)
- [Tổng hợp điểm kiến thức & câu hỏi phỏng vấn RocketMQ thường gặp](./high-performance/message-queue/rocketmq-questions.md)
- [Tổng hợp điểm kiến thức & câu hỏi phỏng vấn Kafka thường gặp](./high-performance/message-queue/kafka-questions-01.md)

## High availability

[Hướng dẫn thiết kế hệ thống high availability](./high-availability/high-availability-system-design.md)

### Thiết kế dự phòng

[Giải thích chi tiết thiết kế dự phòng (redundancy)](./high-availability/redundancy.md)

### Rate limiting

[Giải thích chi tiết rate limiting cho service](./high-availability/limit-request.md)

### Degradation & circuit breaker

[Giải thích chi tiết degradation & circuit breaker](./high-availability/fallback-and-circuit-breaker.md)

### Timeout & retry

[Giải thích chi tiết timeout & retry](./high-availability/timeout-and-retry.md)

### Cluster

Triển khai nhiều bản của cùng một service, tránh single point of failure.

### Thiết kế disaster recovery và multi-active đa vùng

**Disaster recovery** = chống thảm họa + backup.

- **Backup**: sao lưu thêm nhiều bản cho toàn bộ dữ liệu quan trọng mà hệ thống sinh ra.
- **Chống thảm họa**: xây dựng hai hệ thống hoàn toàn giống nhau ở hai vùng địa lý khác nhau. Khi hệ thống ở một nơi đột ngột chết, toàn bộ ứng dụng có thể chuyển sang nơi còn lại, nhờ đó hệ thống vẫn cung cấp dịch vụ bình thường.

**Multi-active đa vùng** mô tả việc triển khai service ở nhiều vùng địa lý và tất cả đều đồng thời cung cấp dịch vụ ra bên ngoài. Khác biệt chính so với thiết kế disaster recovery truyền thống nằm ở chữ "multi-active", tức mọi site đều đang phục vụ cùng lúc. Multi-active đa vùng nhằm ứng phó với tình huống bất ngờ như hỏa hoạn, động đất và các thảm họa tự nhiên hoặc do con người gây ra.

## Xu hướng Star

![Stars](https://api.star-history.com/svg?repos=Snailclimb/JavaGuide&type=Date)

## Tài khoản công khai

Nếu mọi người muốn theo dõi real-time các bài viết tôi cập nhật và nội dung giá trị tôi chia sẻ, có thể theo dõi tài khoản công khai "**JavaGuide**" của tôi.

![Tài khoản công khai JavaGuide](https://oss.javaguide.cn/github/javaguide/gongzhonghaoxuanchuan.png)
