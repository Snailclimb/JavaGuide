const { config } = require("vuepress-theme-hope");
const CompressionPlugin = require("compression-webpack-plugin");

module.exports = config({
  port: "8080",
  title: "JavaGuide",
  description: "Java学习&&面试指南",
  //指定 vuepress build 的输出目录
  dest: "./dist",
  // 是否开启默认预加载js
  shouldPrefetch: (file, type) => false,
  // webpack 配置 https://vuepress.vuejs.org/zh/config/#chainwebpack
  // chainWebpack: config => {
  //   if (process.env.NODE_ENV === 'production') {
  //     const dateTime = new Date().getTime();

  //     // 清除js版本号
  //     config.output.filename('assets/js/jg-[name].js?v=' + dateTime).end();
  //     config.output.chunkFilename('assets/js/jg-[name].js?v=' + dateTime).end();

  //     // 清除css版本号
  //     config.plugin('mini-css-extract-plugin').use(require('mini-css-extract-plugin'), [{
  //       filename: 'assets/css/[name].css?v=' + dateTime,
  //       chunkFilename: 'assets/css/[name].css?v=' + dateTime
  //     }]).end();

  //   }
  // },
  configureWebpack: {
    //vuepress 编译压缩
    plugins: [new CompressionPlugin({
      filename: "[path].gz", //编译后的文件名
      algorithm: "gzip",
      test: /\.js$|\.css$|\.html$/,//需要编译的文件
      threshold: 10240,//需要编译的文件大小
      minRatio: 0.8,//压缩比
      deleteOriginalAssets: false,//编译时是否删除源文件
    })],
  },

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
      "script", {},
      `var _hmt = _hmt || [];
      (function() {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?5dd2e8c97962d57b7b8fea1737c01743";
        var s = document.getElementsByTagName("script")[0]; 
        s.parentNode.insertBefore(hm, s);
      })();`
    ]
  ],
  locales: {
    "/": {
      lang: "zh-CN"
    }
  },
  themeConfig: {
    logo: "/logo.png", hostname: "https://javaguide.cn/", author: "Guide哥", repo: "https://github.com/Snailclimb/JavaGuide",
    editLinks: true, docsDir: 'docs',
    nav: [
      { text: "Java面试指南", icon: "java", link: "/home", },
      { text: "Java面试指北", icon: "java", link: "https://sourl.cn/e7ee87", },
      {
        text: "开发工具", icon: "Tools", link: "/tools/",
        items: [
          { text: "Database", icon: "database", link: "/tools/database/chiner/" },
          { text: "Git", icon: "git", link: "/tools/git/git-intro/" },
          { text: "Docker", icon: "docker1", link: "/tools/docker/docker-intro/" },
          { text: "IntelliJ IDEA", icon: "intellijidea", link: "/idea-tutorial/" },
        ]
      },
      { text: "关于作者", icon: "zuozhe", link: "/about-the-author/" },
    ],
    sidebar: {
      // 应该把更精确的路径放置在前边
      "/about-the-author/": [
        {
          title: "个人经历", icon: "zuozhe", collapsable: false,
          children: ["internet-addiction-teenager", "javaguide-100k-star", "feelings-after-one-month-of-induction-training", "feelings-of-half-a-year-from-graduation-to-entry",]
        },
        {
          title: "杂谈", icon: "chat", collapsable: false,
          children: ["my-article-was-stolen-and-made-into-video-and-it-became-popular", "dog-that-copies-other-people-essay",]
        },
      ],
      '/tools/': [
        {
          title: "Database", icon: "database", prefix: "database/", collapsable: false,
          children: ["chiner", "dbeaver", "screw", "datagrip"]
        },
        {
          title: "Git", icon: "git", prefix: "git/", collapsable: false,
          children: ["git-intro", "github-tips"]
        },
        {
          title: "Docker", icon: "docker1", prefix: "docker/", collapsable: false,
          children: ["docker-intro", "docker从入门到实战"]
        },
      ],
      '/high-quality-technical-articles/': [
        {
          title: "练级攻略", icon: "lujing", prefix: "advanced-programmer/", collapsable: false,
          children: ["seven-tips-for-becoming-an-advanced-programmer"]
        },
        {
          title: "个人经历", icon: "zuozhe", prefix: "personal-experience/", collapsable: false,
          children: ["two-years-of-back-end-develop--experience-in-didi&toutiao", "8-years-programmer-work-summary"]
        },
        {
          title: "面试", icon: "mianshixinxi-02", prefix: "interview/", collapsable: false,
          children: ["the-experience-and-thinking-of-an-interview-experienced-by-an-older-programmer", "technical-preliminary-preparation", "screen-candidates-for-packaging"],
        },
        {
          title: "工作", icon: "work0", prefix: "work/", collapsable: false,
          children: ["get-into-work-mode-quickly-when-you-join-a-company"]
        }
      ],
      '/idea-tutorial/':
        [
          {
            title: "IDEA小技巧", icon: "tips", prefix: "idea-tips/", collapsable: false,
            children: [
              "idea-refractor-intro",
              "idea-plug-in-development-intro",
              "idea-source-code-reading-skills",
            ]
          },
          {
            title: "IDEA插件推荐", icon: "chajian1", collapsable: false, prefix: "idea-plugins/",
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
                children: [
                  "why-there-only-value-passing-in-java", "反射机制详解", "代理模式详解", "io模型详解",
                  "bigdecimal"
                ],
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
              children: [
                "spring-knowledge-and-questions-summary", "spring-common-annotations", "spring-transaction", "spring-design-patterns-summary", "spring-boot-auto-assembly-principles"
              ]
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
            title: "分布式协调", prefix: "distributed-process-coordination/",
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
      intro: "/about-the-author/",
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
      enableAll: false,
      presentation: {
        plugins: [
          "highlight", "math", "search", "notes", "zoom", "anything", "audio", "chalkboard",
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
