import { sidebar } from "vuepress-theme-hope";

import { aboutTheAuthor } from "./about-the-author.js";
import { ai } from "./ai.js";
import { aiCoding } from "./ai-coding.js";
import { books } from "./books.js";
import { csBasics } from "./cs-basics.js";
import { highQualityTechnicalArticles } from "./high-quality-technical-articles.js";
import { openSourceProject } from "./open-source-project.js";
import { roadmap } from "./roadmap.js";
import { zhuanlan } from "./zhuanlan.js";
import {
  ICONS,
  createImportantSection,
  createSourceCodeSection,
} from "./constants.js";

export default sidebar({
  // Đường dẫn càng cụ thể thì phải đặt càng lên trên
  "/ai-coding/": aiCoding,
  "/ai/": ai,
  "/roadmap/": roadmap,
  "/cs-basics/": csBasics,
  "/open-source-project/": openSourceProject,
  "/books/": books,
  "/about-the-author/": aboutTheAuthor,
  "/high-quality-technical-articles/": highQualityTechnicalArticles,
  "/zhuanlan/": zhuanlan,
  // Bắt buộc đặt ở cuối cùng
  "/": [
    {
      text: "Giới thiệu project",
      icon: ICONS.STAR,
      collapsible: true,
      prefix: "javaguide/",
      children: ["intro", "use-suggestion", "contribution-guideline", "faq"],
    },
    {
      text: "Chuẩn bị phỏng vấn (bắt buộc xem)",
      icon: ICONS.INTERVIEW,
      collapsible: true,
      prefix: "interview-preparation/",
      children: [
        {
          text: "Hệ thống kiến thức chuẩn bị phỏng vấn",
          link: "/interview-preparation/",
        },
        {
          text: "⭐Kế hoạch vượt qua phỏng vấn Java backend",
          link: "backend-interview-plan",
        },
        {
          text: "⭐Chuẩn bị phỏng vấn Java hiệu quả thế nào?",
          link: "teach-you-how-to-prepare-for-the-interview-hand-in-hand",
        },
        {
          text: "⭐Hướng dẫn viết CV cho lập trình viên",
          link: "resume-guide",
        },
        {
          text: "⭐Tổng hợp trọng điểm phỏng vấn Java backend",
          link: "key-points-of-interview",
        },
        {
          text: "Tài liệu PDF phỏng vấn Java + backend",
          link: "pdf-interview-javaguide",
        },
        { text: "Lộ trình học Java", link: "java-roadmap" },
        {
          text: "⭐Hướng dẫn về kinh nghiệm project",
          link: "project-experience-guide",
        },
        {
          text: "⭐Trình bày project backend khi phỏng vấn thế nào?",
          link: "backend-project-interview-guide",
        },
        "how-to-handle-interview-nerves",
        "internship-experience",
      ],
    },
    {
      text: "Java",
      icon: ICONS.JAVA,
      collapsible: true,
      prefix: "java/",
      children: [
        {
          text: "Hệ thống kiến thức Java",
          link: "/java/",
        },
        {
          text: "Cơ bản",
          prefix: "basis/",
          icon: ICONS.BASIC,
          children: [
            {
              text: "⭐Câu hỏi phỏng vấn Java Basics thường gặp (phần 1)",
              link: "java-basic-questions-01",
            },
            {
              text: "⭐Câu hỏi phỏng vấn Java Basics thường gặp (phần 2)",
              link: "java-basic-questions-02",
            },
            {
              text: "⭐Câu hỏi phỏng vấn Java Basics thường gặp (phần 3)",
              link: "java-basic-questions-03",
            },
            createImportantSection([
              "why-there-only-value-passing-in-java",
              "serialization",
              "generics-and-wildcards",
              "reflection",
              "proxy",
              "bigdecimal",
              {
                text: "Chọn kiểu dữ liệu tiền tệ trong Java",
                link: "money-long-vs-bigdecimal",
              },
              "unsafe",
              "spi",
              "syntactic-sugar",
            ]),
          ],
        },
        {
          text: "Collection",
          prefix: "collection/",
          icon: ICONS.CONTAINER,
          children: [
            {
              text: "⭐Câu hỏi phỏng vấn Java Collection thường gặp (phần 1)",
              link: "java-collection-questions-01",
            },
            {
              text: "⭐Câu hỏi phỏng vấn Java Collection thường gặp (phần 2)",
              link: "java-collection-questions-02",
            },
            "java-collection-precautions-for-use",
            createSourceCodeSection([
              "arraylist-source-code",
              "linkedlist-source-code",
              "hashmap-source-code",
              "concurrent-hash-map-source-code",
              "linkedhashmap-source-code",
              "copyonwritearraylist-source-code",
              "arrayblockingqueue-source-code",
              "priorityqueue-source-code",
              "delayqueue-source-code",
            ]),
          ],
        },
        {
          text: "Concurrent Programming",
          prefix: "concurrent/",
          icon: ICONS.PERFORMANCE,
          children: [
            {
              text: "⭐Câu hỏi phỏng vấn Java Concurrency thường gặp (phần 1)",
              link: "java-concurrent-questions-01",
            },
            {
              text: "⭐Câu hỏi phỏng vấn Java Concurrency thường gặp (phần 2)",
              link: "java-concurrent-questions-02",
            },
            {
              text: "⭐Câu hỏi phỏng vấn Java Concurrency thường gặp (phần 3)",
              link: "java-concurrent-questions-03",
            },
            createImportantSection([
              {
                text: "Giải thích chi tiết lock trong Java",
                link: "java-lock",
              },
              "optimistic-lock-and-pessimistic-lock",
              "cas",
              "jmm",
              "java-thread-pool-summary",
              "java-thread-pool-best-practices",
              "java-concurrent-collections",
              "aqs",
              "atomic-classes",
              "threadlocal",
              "completablefuture-intro",
              "virtual-thread",
            ]),
          ],
        },
        {
          text: "IO",
          prefix: "io/",
          icon: ICONS.CODE,
          collapsible: true,
          children: ["io-basis", "io-design-patterns", "io-model", "nio-basis"],
        },
        {
          text: "JVM",
          prefix: "jvm/",
          icon: ICONS.VIRTUAL_MACHINE,
          collapsible: true,
          children: [
            {
              text: "⭐Tổng hợp câu hỏi phỏng vấn JVM thường gặp",
              link: "jvm-interview-questions",
            },
            "memory-area",
            "jvm-garbage-collection",
            "class-file-structure",
            "class-loading-process",
            "classloader",
            "jvm-parameters-intro",
            "jdk-monitoring-and-troubleshooting-tools",
            {
              text: "Truy vết sự cố production Java backend",
              link: "jvm-in-action",
            },
          ],
        },
        {
          text: "Tính năng mới",
          prefix: "new-features/",
          icon: ICONS.FEATURED,
          collapsible: true,
          children: [
            "java8-common-new-features",
            "java8-tutorial-translate",
            "java9",
            "java10",
            "java11",
            "java12-13",
            "java14-15",
            "java16",
            "java17",
            "java18",
            "java19",
            "java20",
            "java21",
            "java22-23",
            "java24",
            "java25",
          ],
        },
      ],
    },
    {
      text: "Database",
      icon: ICONS.DATABASE,
      prefix: "database/",
      collapsible: true,
      children: [
        {
          text: "Hệ thống kiến thức Database",
          link: "/database/",
        },
        {
          text: "Cơ bản",
          icon: ICONS.BASIC,
          children: [
            "basis",
            "nosql",
            {
              text: "Giải thích chi tiết character set",
              link: "character-set",
            },
            {
              text: "SQL",
              icon: ICONS.SQL,
              prefix: "sql/",
              collapsible: true,
              children: [
                "sql-syntax-summary",
                "sql-questions-01",
                "sql-questions-02",
                "sql-questions-03",
                "sql-questions-04",
                "sql-questions-05",
              ],
            },
          ],
        },
        {
          text: "MySQL",
          prefix: "mysql/",
          icon: ICONS.MYSQL,
          children: [
            {
              text: "⭐Tổng hợp câu hỏi phỏng vấn MySQL thường gặp",
              link: "mysql-questions-01",
            },
            "mysql-high-performance-optimization-specification-recommendations",
            createImportantSection([
              "mysql-index",
              "mysql-index-invalidation",
              {
                text: "Giải thích chi tiết ba loại log của MySQL",
                link: "mysql-logs",
              },
              {
                text: "Backup và restore MySQL",
                link: "mysql-backup-and-restore",
              },
              {
                text: "Giải pháp đồng bộ MySQL sang ES",
                link: "mysql-to-elasticsearch-sync",
              },
              "transaction-isolation-level",
              "innodb-implementation-of-mvcc",
              "how-sql-executed-in-mysql",
              "mysql-query-cache",
              "mysql-query-execution-plan",
              "mysql-auto-increment-primary-key-continuous",
              "some-thoughts-on-database-storage-time",
              "index-invalidation-caused-by-implicit-conversion",
            ]),
          ],
        },
        {
          text: "Redis",
          prefix: "redis/",
          icon: ICONS.REDIS,
          children: [
            "cache-basics",
            {
              text: "⭐Tổng hợp câu hỏi phỏng vấn Redis thường gặp (phần 1)",
              link: "redis-questions-01",
            },
            {
              text: "⭐Tổng hợp câu hỏi phỏng vấn Redis thường gặp (phần 2)",
              link: "redis-questions-02",
            },
            createImportantSection([
              "redis-delayed-task",
              "redis-stream-mq",
              "3-commonly-used-cache-read-and-write-strategies",
              "redis-data-structures-01",
              "redis-data-structures-02",
              "redis-skiplist",
              "redis-persistence",
              "redis-memory-fragmentation",
              "redis-common-blocking-problems-summary",
              "redis-cluster",
            ]),
          ],
        },
        {
          text: "Elasticsearch",
          prefix: "elasticsearch/",
          icon: ICONS.ELASTICSEARCH,
          collapsible: true,
          children: ["elasticsearch-questions-01"],
        },
        {
          text: "MongoDB",
          prefix: "mongodb/",
          icon: ICONS.MONGODB,
          collapsible: true,
          children: ["mongodb-questions-01", "mongodb-questions-02"],
        },
      ],
    },
    {
      text: "Công cụ phát triển",
      icon: ICONS.TOOL,
      prefix: "tools/",
      collapsible: true,
      children: [
        {
          text: "Hệ thống kiến thức công cụ phát triển",
          link: "/tools/",
        },
        {
          text: "Maven",
          icon: ICONS.MAVEN,
          prefix: "maven/",
          children: [
            {
              text: "Tổng hợp khái niệm cốt lõi Maven",
              link: "maven-core-concepts",
            },
            { text: "Best practice cho Maven", link: "maven-best-practices" },
          ],
        },
        {
          text: "Gradle",
          icon: ICONS.GRADLE,
          prefix: "gradle/",
          children: ["gradle-core-concepts"],
        },
        {
          text: "Git",
          icon: ICONS.GIT,
          prefix: "git/",
          children: ["git-intro", "github-tips"],
        },
        {
          text: "Docker",
          icon: ICONS.DOCKER,
          prefix: "docker/",
          children: ["docker-intro", "docker-in-action"],
        },
        {
          text: "IDEA",
          icon: ICONS.IDEA,
          link: "https://gitee.com/SnailClimb/awesome-idea-tutorial",
        },
      ],
    },
    {
      text: "Framework thường dùng",
      prefix: "system-design/framework/",
      icon: ICONS.COMPONENT,
      collapsible: true,
      children: [
        {
          text: "Spring&Spring Boot",
          icon: ICONS.SPRING_BOOT,
          prefix: "spring/",
          children: [
            {
              text: "Tổng hợp câu hỏi phỏng vấn Spring thường gặp",
              link: "spring-knowledge-and-questions-summary",
            },
            {
              text: "Tổng hợp câu hỏi phỏng vấn Spring Boot thường gặp",
              link: "springboot-knowledge-and-questions-summary",
            },
            "spring-common-annotations",
            "springboot-source-code",
            createImportantSection([
              "ioc-and-aop",
              "spring-transaction",
              "spring-design-patterns-summary",
              "spring-boot-auto-assembly-principles",
              "async",
            ]),
          ],
        },
        {
          text: "Tổng hợp câu hỏi phỏng vấn MyBatis thường gặp",
          link: "mybatis/mybatis-interview",
        },
        "netty",
      ],
    },
    {
      text: "System Design",
      icon: ICONS.DESIGN,
      prefix: "system-design/",
      collapsible: true,
      children: [
        {
          text: "Hệ thống kiến thức System Design",
          link: "/system-design/",
        },
        {
          text: "Kiến thức cơ bản",
          prefix: "basis/",
          icon: ICONS.BASIC,
          collapsible: true,
          children: [
            "RESTfulAPI",
            "software-engineering",
            "naming",
            "refactoring",
            {
              text: "Hướng dẫn unit test",
              link: "unit-test",
            },
          ],
        },
        {
          text: "Authentication & Authorization",
          prefix: "security/",
          icon: ICONS.SECURITY,
          collapsible: true,
          children: [
            "basis-of-authority-certification",
            "jwt-intro",
            "advantages-and-disadvantages-of-jwt",
            "sso-intro",
            "design-of-authority-system",
          ],
        },
        {
          text: "An toàn dữ liệu",
          prefix: "security/",
          icon: ICONS.SECURITY,
          collapsible: true,
          children: [
            "encryption-algorithms",
            "sentive-words-filter",
            "data-desensitization",
            "data-validation",
            "why-password-reset-instead-of-retrieval",
          ],
        },
        {
          text: "⭐Tổng hợp câu hỏi phỏng vấn System Design thường gặp",
          link: "system-design-questions",
        },
        {
          text: "⭐Tổng hợp câu hỏi phỏng vấn Design Pattern thường gặp",
          link: "https://interview.javaguide.cn/system-design/design-pattern.html",
        },
        "schedule-task",
        "web-real-time-message-push",
      ],
    },
    {
      text: "Distributed",
      icon: ICONS.DISTRIBUTED,
      prefix: "distributed-system/",
      collapsible: true,
      children: [
        {
          text: "Nhập môn Distributed System",
          link: "distributed-system-intro",
        },
        {
          text: "⭐Câu hỏi phỏng vấn Distributed tần suất cao",
          link: "distributed-system-interview-questions",
        },
        {
          text: "⭐Câu hỏi phỏng vấn Microservice tần suất cao",
          link: "microservices-interview-questions",
        },
        {
          text: "Lý thuyết & thuật toán & giao thức",
          icon: ICONS.ALGORITHM,
          prefix: "protocol/",
          collapsible: true,
          children: [
            {
              text: "Chuyên đề lý thuyết & thuật toán & giao thức",
              link: "/distributed-system/protocol/",
            },
            {
              text: "Giải thích chi tiết định lý CAP và lý thuyết BASE",
              link: "cap-and-base-theorem",
            },
            {
              text: "Giải thích chi tiết Distributed Coordination",
              link: "centralized-and-decentralized",
            },
            {
              text: "Bài toán Byzantine Generals",
              link: "byzantine-generals-problem",
            },
            {
              text: "Giải thích chi tiết thuật toán Paxos",
              link: "paxos-algorithm",
            },
            {
              text: "Giải thích chi tiết thuật toán Raft",
              link: "raft-algorithm",
            },
            { text: "Giải thích chi tiết giao thức ZAB", link: "zab" },
            {
              text: "Giải thích chi tiết giao thức Gossip",
              link: "gossip-protocol",
            },
            {
              text: "Giải thích chi tiết thuật toán Consistent Hashing",
              link: "consistent-hashing",
            },
          ],
        },
        {
          text: "API Gateway",
          icon: ICONS.GATEWAY,
          children: [
            {
              text: "Tổng hợp kiến thức cơ bản API Gateway",
              link: "api-gateway",
            },
            {
              text: "Tổng hợp câu hỏi phỏng vấn Spring Cloud Gateway",
              link: "spring-cloud-gateway-questions",
            },
          ],
        },
        {
          text: "Distributed ID",
          icon: ICONS.ID,
          children: [
            {
              text: "Giải thích chi tiết giải pháp sinh Distributed ID",
              link: "distributed-id",
            },
            {
              text: "Hướng dẫn thực chiến thiết kế Distributed ID",
              link: "distributed-id-design",
            },
          ],
        },
        {
          text: "Distributed Lock",
          icon: ICONS.LOCK,
          children: [
            {
              text: "Giới thiệu nhập môn Distributed Lock",
              link: "distributed-lock",
            },
            {
              text: "Tổng hợp giải pháp hiện thực Distributed Lock thường gặp",
              link: "distributed-lock-implementations",
            },
          ],
        },
        {
          text: "Distributed Transaction",
          icon: ICONS.TRANSACTION,
          children: [
            {
              text: "Tổng hợp giải pháp Distributed Transaction",
              link: "distributed-transaction",
            },
          ],
        },
        {
          text: "Distributed Configuration Center",
          icon: ICONS.MAVEN,
          children: [
            {
              text: "Tổng hợp câu hỏi phỏng vấn Distributed Configuration Center",
              link: "distributed-configuration-center",
            },
          ],
        },
        {
          text: "RPC",
          prefix: "rpc/",
          icon: ICONS.RPC,
          collapsible: true,
          children: [
            { text: "Chuyên đề RPC", link: "/distributed-system/rpc/" },
            { text: "Tổng hợp kiến thức cơ bản RPC", link: "rpc-intro" },
            { text: "Tổng hợp câu hỏi phỏng vấn Dubbo", link: "dubbo" },
          ],
        },
        {
          text: "ZooKeeper",
          prefix: "distributed-process-coordination/zookeeper/",
          icon: ICONS.FRAMEWORK,
          collapsible: true,
          children: [
            {
              text: "Chuyên đề ZooKeeper",
              link: "/distributed-system/distributed-process-coordination/zookeeper/",
            },
            { text: "Hướng dẫn nhập môn ZooKeeper", link: "zookeeper-intro" },
            {
              text: "Giải thích chi tiết ZooKeeper nâng cao",
              link: "zookeeper-plus",
            },
            {
              text: "Giáo trình thực chiến ZooKeeper",
              link: "zookeeper-in-action",
            },
          ],
        },
      ],
    },
    {
      text: "High Performance",
      icon: ICONS.PERFORMANCE,
      prefix: "high-performance/",
      collapsible: true,
      children: [
        {
          text: "⭐Câu hỏi phỏng vấn thiết kế hệ thống High Performance tần suất cao",
          link: "high-performance-system-interview-questions",
        },
        {
          text: "CDN",
          icon: ICONS.CDN,
          children: ["cdn"],
        },
        {
          text: "Load Balancing",
          icon: ICONS.LOAD_BALANCING,
          children: [
            {
              text: "Giải thích chi tiết nguyên lý và thuật toán Load Balancing",
              link: "load-balancing",
            },
          ],
        },
        {
          text: "Tối ưu Database",
          icon: ICONS.MYSQL,
          children: [
            "read-and-write-separation-and-library-subtable",
            "data-cold-hot-separation",
            "sql-optimization",
            "deep-pagination-optimization",
          ],
        },
        {
          text: "Message Queue",
          prefix: "message-queue/",
          icon: ICONS.MQ,
          collapsible: true,
          children: [
            {
              text: "⭐Câu hỏi phỏng vấn Message Queue tần suất cao",
              link: "message-queue-interview-questions",
            },
            "message-queue",
            "disruptor-questions",
            "kafka-questions-01",
            "rocketmq-questions",
            "rabbitmq-questions",
          ],
        },
      ],
    },
    {
      text: "High Availability",
      icon: ICONS.HIGH_AVAILABLE,
      prefix: "high-availability/",
      collapsible: true,
      children: [
        {
          text: "⭐Tổng hợp câu hỏi phỏng vấn hệ thống High Availability",
          link: "high-availability-system-interview-questions",
        },
        {
          text: "Hướng dẫn thiết kế hệ thống High Availability",
          link: "high-availability-system-design",
        },
        {
          text: "⭐Tổng hợp giải pháp idempotent cho API",
          link: "idempotency",
        },
        {
          text: "⭐Giải thích chi tiết rate limiting",
          link: "limit-request",
        },
        {
          text: "⭐Giải thích chi tiết cơ chế timeout và retry",
          link: "timeout-and-retry",
        },
        {
          text: "Giải thích chi tiết degradation và circuit breaker",
          link: "fallback-and-circuit-breaker",
        },
        {
          text: "Giải thích chi tiết thiết kế dự phòng",
          link: "redundancy",
        },
        {
          text: "Nhập môn performance testing",
          link: "performance-test",
        },
      ],
    },
  ],
});
