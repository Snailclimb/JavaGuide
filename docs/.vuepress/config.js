const { config } = require("vuepress-theme-hope");

module.exports = config({
  title: "JavaGuide",
  description: "Java学习&&面试指南",
  dest: "./dist",
  head: [
    [
      "script",
      { src: "https://cdn.jsdelivr.net/npm/react/umd/react.production.min.js" },
    ],
    [
      "script",
      {
        src: "https://cdn.jsdelivr.net/npm/react-dom/umd/react-dom.production.min.js",
      },
    ],
    ["script", { src: "https://cdn.jsdelivr.net/npm/vue/dist/vue.min.js" }],
    [
      "script",
      { src: "https://cdn.jsdelivr.net/npm/@babel/standalone/babel.min.js" },
    ],
    // 添加百度统计
    [
      "script",{},
      `var _hmt = _hmt || [];
      (function() {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?5dd2e8c97962d57b7b8fea1737c01743";
        var s = document.getElementsByTagName("script")[0]; 
        s.parentNode.insertBefore(hm, s);
      })();`
    ]
  ],

  themeConfig: {
    logo: "/logo.png",
    hostname: "https://javaguide.cn/",
    author: "Guide哥",
    repo: "https://github.com/Snailclimb/JavaGuide",
    nav: [
      { text: "Java面试指南", icon: "java", link: "/", },
      { text: "Java面试指北", icon: "java", link: "https://www.yuque.com/docs/share/f37fc804-bfe6-4b0d-b373-9c462188fec7?#%20%E3%80%8A%E3%80%8AJava%E9%9D%A2%E8%AF%95%E8%BF%9B%E9%98%B6%E6%8C%87%E5%8C%97%20%20%E6%89%93%E9%80%A0%E4%B8%AA%E4%BA%BA%E7%9A%84%E6%8A%80%E6%9C%AF%E7%AB%9E%E4%BA%89%E5%8A%9B%E3%80%8B%E3%80%8B", },
      {
        text: "Java精选", icon: "file", icon: "java",
        items: [
          { text: "Java书单精选", icon: "book", link: "https://gitee.com/SnailClimb/awesome-cs" },
          { text: "Java学习路线", icon: "luxianchaxun", link: "https://zhuanlan.zhihu.com/p/379041500" },
          { text: "Java开源项目精选", icon: "git", link: "https://gitee.com/SnailClimb/awesome-java" }
        ],
      },
      { text: "IDEA指南", icon: "intellijidea", link: "/idea-tutorial/", },
      { text: "开发工具", icon: "Tools", link: "/tools/", },
      {
        text: "PDF资源", icon: "pdf",
        items: [
          { text: "JavaGuide面试突击版", link: "https://t.1yb.co/Fy1e", },
          { text: "消息队列常见知识点&面试题总结", link: "https://t.1yb.co/Fy0u", },
          { text: "图解计算机基础!", link: "https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=100021725&idx=1&sn=2db9664ca25363139a81691043e9fd8f&chksm=4ea19a1679d61300d8990f7e43bfc7f476577a81b712cf0f9c6f6552a8b219bc081efddb5c54#rd" }
        ],
      },
      {
        text: "关于作者", icon: "zuozhe", link: "/about-the-author/"
      },
    ],
    sidebar: {
      "/about-the-author/": [
        "internet-addiction-teenager", "feelings-after-one-month-of-induction-training"
      ],
      // 应该把更精确的路径放置在前边
      '/tools/': [
        {
          title: "数据库",
          icon: "database",
          prefix: "database/",
          collapsable: false,
          children: ["CHINER", "DBeaver", "screw"]
        },
        {
          title: "Git",
          icon: "git",
          prefix: "git/",
          collapsable: false,
          children: ["git-intro", "github技巧"]
        },
        {
          title: "Docker",
          icon: "docker1",
          prefix: "docker/",
          collapsable: false,
          children: ["docker", "docker从入门到实战"]
        },
      ],
      '/idea-tutorial/':
        [
          {
            title: "IDEA小技巧",
            icon: "creative",
            prefix: "idea-tips/",
            collapsable: false,
            children: [
              "idea-refractor-intro",
              "idea-plug-in-development-intro",
              "idea-source-code-reading-skills",
            ]
          },
          {
            title: "IDEA插件推荐",
            icon: "plugin",
            collapsable: false,
            prefix: "idea-plugins/",
            children: [
              "shortcut-key", "idea-themes", "improve-code", "interface-beautification",
              "camel-case", "code-glance", "code-statistic",
              "git-commit-template", "gson-format", "idea-features-trainer", "jclasslib",
              "maven-helper", "rest-devlop", "save-actions", "sequence-diagram", "translation",
              "others"
            ]
          },
        ],
      // 必须放在最后面
      '/': [{
        title: "Java", icon: "java", prefix: "java/",
        children: [
          {
            title: "基础", prefix: "basis/",
            children: [
              "java基础知识总结",
              {
                title: "重要知识点",
                children: ["反射机制详解", "代理模式详解", "io模型详解"],
              },],
          },
          {
            title: "容器", prefix: "collection/",
            children: [
              "java集合框架基础知识&面试题总结", "java集合使用注意事项",
              {
                title: "源码分析",
                children: ["arraylist-source-code", "hashmap-source-code", "concurrent-hash-map-source-code"],
              },],
          },
          {
            title: "并发编程", prefix: "concurrent/",
            children: [
              "java并发基础常见面试题总结", "java并发进阶常见面试题总结",
              {
                title: "重要知识点",
                children: ["java线程池学习总结", "并发容器总结", "拿来即用的java线程池最佳实践", "aqs原理以及aqs同步组件总结", "reentrantlock",
                  "atomic原子类总结", "threadlocal", "completablefuture-intro"],
              },
            ],
          },
          {
            title: "JVM", prefix: "jvm/",
            children: ["memory-area", "jvm-garbage-collection", "class-file-structure", "class-loading-process", "classloader", "jvm-parameters-intro", "jvm-intro", "jdk-monitoring-and-troubleshooting-tools"],
          },
          {
            title: "新特性", prefix: "new-features/",
            children: ["java8-common-new-features", "java8-tutorial-translate", "java新特性总结"],
          },
          {
            title: "小技巧", prefix: "tips/",
            children: ["locate-performance-problems/手把手教你定位常见Java性能问题", "jad"],
          },
        ],
      },
      {
        title: "计算机基础", icon: "computer", prefix: "cs-basics/",
        children: [
          {
            title: "计算机网络", prefix: "network/", icon: "network",
            children: [
              "计算机网络常见面试题", "谢希仁老师的《计算机网络》内容总结", "HTTPS中的TLS"
            ],
          },
          {
            title: "操作系统", prefix: "operating-system/", icon: "caozuoxitong",
            children: [
              "操作系统常见面试题&知识点总结", "linux-intro", "shell-intro"
            ],
          },
          {
            title: "数据结构", prefix: "data-structure/", icon: "people-network-full",
            children: [
              "线性数据结构", "图", "堆", "树", "红黑树", "bloom-filter"
            ],
          },
          {
            title: "算法", prefix: "algorithms/", icon: "suanfaku",
            children: [
              "几道常见的字符串算法题", "几道常见的链表算法题", "剑指offer部分编程题"
            ],
          },
        ],

      },
      {
        title: "数据库", icon: "database", prefix: "database/",
        children: [
          "数据库基础知识",
          "字符集",
          {
            title: "MySQL", prefix: "mysql/",
            children: [
              "mysql知识点&面试题总结",
              "a-thousand-lines-of-mysql-study-notes",
              "mysql-high-performance-optimization-specification-recommendations",
              "mysql-index", "mysql-logs", "transaction-isolation-level",
              "innodb-implementation-of-mvcc", "how-sql-executed-in-mysql",
              "some-thoughts-on-database-storage-time"
            ],
          },
          {
            title: "Redis", prefix: "redis/",
            children: ["redis知识点&面试题总结", "3-commonly-used-cache-read-and-write-strategies"],
          },
        ],
      },
      {
        title: "系统设计", icon: "xitongsheji", prefix: "system-design/",
        children: [
          {
            title: "基础", prefix: "basis/", icon: "jibendebasic",
            children: [
              "RESTfulAPI",
              "naming",
            ],
          },
          {
            title: "常用框架", prefix: "framework/", icon: "framework",
            children: [{
              title: "Spring", prefix: "spring/",
              children: ["Spring常见问题总结", "Spring&SpringBoot常用注解总结", "Spring事务总结", "Spring设计模式总结", "SpringBoot自动装配原理"]
            },
              "mybatis/mybatis-interview", "netty",
            {
              title: "SpringCloud", prefix: "springcloud/",
              children: ["springcloud-intro"]
            },
            ],
          },
          {
            title: "安全", prefix: "security/", icon: "security-fill",
            children: ["basis-of-authority-certification", "jwt优缺点分析以及常见问题解决方案", "sso-intro", "数据脱敏"]
          },
          "定时任务"
        ],
      },
      {
        title: "分布式", icon: "distributed-network", prefix: "distributed-system/",
        children: [
          {
            title: "理论&算法", prefix: "理论&算法/",
            children: ["cap&base理论", "paxos&raft算法"],
          },
          "api-gateway", "distributed-id",
          {
            title: "rpc", prefix: "rpc/",
            children: ["dubbo", "why-use-rpc"]
          },
          "distributed-transaction",
          {
            title: "分布式协调", prefix: "分布式协调/",
            children: ["zookeeper/zookeeper-intro", "zookeeper/zookeeper-plus", "zookeeper/zookeeper-in-action"]
          },
        ],
      }, {
        title: "高性能", icon: "gaojixiaozuzhibeifen", prefix: "high-performance/",
        children: [
          "读写分离&分库分表", "负载均衡",
          {
            title: "消息队列", prefix: "message-queue/",
            children: ["message-queue", "kafka知识点&面试题总结", "rocketmq-intro", "rocketmq-questions", "rabbitmq-intro"],
          },
        ],
      }, {
        title: "高可用", icon: "CalendarAvailability-1", prefix: "high-availability/",
        children: [
          "高可用系统设计", "limit-request", "降级&熔断", "超时和重试机制", "集群", "灾备设计和异地多活", "性能测试"
        ],
      }],
    },
    blog: {
      intro: "/intro/",
      sidebarDisplay: "mobile",
      links: {
        Zhihu: "https://www.zhihu.com/people/javaguide",
        Github: "https://github.com/Snailclimb",
        Gitee: "https://gitee.com/SnailClimb",
      },
    },

    footer: {
      display: true,
      content: '<a href="https://beian.miit.gov.cn/" target="_blank">鄂ICP备2020015769号-1</a>',
    },

    copyright: {
      status: "global",
    },

    git: {
      timezone: "Asia/Shanghai",
    },

    mdEnhance: {
      enableAll: true,
      presentation: {
        plugins: [
          "highlight",
          "math",
          "search",
          "notes",
          "zoom",
          "anything",
          "audio",
          "chalkboard",
        ],
      },
    },

    pwa: {
      favicon: "/favicon.ico",
      cachePic: true,
      apple: {
        icon: "/assets/icon/apple-icon-152.png",
        statusBarColor: "black",
      },
      msTile: {
        image: "/assets/icon/ms-icon-144.png",
        color: "#ffffff",
      },
      manifest: {
        icons: [
          {
            src: "/assets/icon/chrome-mask-512.png",
            sizes: "512x512",
            purpose: "maskable",
            type: "image/png",
          },
          {
            src: "/assets/icon/chrome-mask-192.png",
            sizes: "192x192",
            purpose: "maskable",
            type: "image/png",
          },
          {
            src: "/assets/icon/chrome-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/assets/icon/chrome-192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
        shortcuts: [
          {
            name: "Guide",
            short_name: "Guide",
            url: "/guide/",
            icons: [
              {
                src: "/assets/icon/guide-maskable.png",
                sizes: "192x192",
                purpose: "maskable",
                type: "image/png",
              },
              {
                src: "/assets/icon/guide-monochrome.png",
                sizes: "192x192",
                purpose: "monochrome",
                type: "image/png",
              },
            ],
          },
        ],
      },
    },
  },
});
