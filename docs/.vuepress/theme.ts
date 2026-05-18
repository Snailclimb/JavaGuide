import { getDirname, path } from "vuepress/utils";
import { hopeTheme } from "vuepress-theme-hope";

import navbar from "./navbar.js";
import sidebar from "./sidebar/index.js";

const __dirname = getDirname(import.meta.url);
const docsearchAppId = process.env.DOCSEARCH_APP_ID;
const docsearchApiKey = process.env.DOCSEARCH_API_KEY;
const docsearchIndexName = process.env.DOCSEARCH_INDEX_NAME;
const docsearchOptions =
  docsearchAppId && docsearchApiKey && docsearchIndexName
    ? {
        appId: docsearchAppId,
        apiKey: docsearchApiKey,
        indexName: docsearchIndexName,
        locales: {
          "/": {
            placeholder: "搜索 JavaGuide",
          },
        },
      }
    : null;

export default hopeTheme({
  hostname: "https://javaguide.cn/",
  logo: "/logo.png",
  favicon: "/favicon.ico",

  author: {
    name: "Guide",
    url: "https://javaguide.cn/article/",
  },

  repo: "https://github.com/Snailclimb/JavaGuide",
  docsDir: "docs",
  pure: true,
  focus: false,
  print: false,
  breadcrumb: false,
  navbar,
  sidebar,
  footer:
    '<a href="https://beian.miit.gov.cn/" target="_blank">鄂ICP备2020015769号-1</a>',
  displayFooter: true,

  pageInfo: ["Author", "Category", "Tag", "Original", "Word", "ReadingTime"],

  blog: {
    intro: "/about-the-author/",
    medias: {
      Zhihu: "https://www.zhihu.com/people/javaguide",
      Github: "https://github.com/Snailclimb",
      Gitee: "https://gitee.com/SnailClimb",
    },
  },

  markdown: {
    align: true,
    codeTabs: true,
    mermaid: true,
    gfm: true,
    include: {
      resolvePath: (file, cwd) => {
        if (file.startsWith("@"))
          return path.resolve(
            __dirname,
            "../snippets",
            file.replace("@", "./"),
          );

        return path.resolve(cwd, file);
      },
    },
    tasklist: true,
  },

  plugins: {
    blog: true,
    seo: {
      canonical: "https://javaguide.cn",
      fallBackImage: "https://javaguide.cn/logo.png",
      customHead: (head, page) => {
        if (page.path === "/")
          head.push([
            "script",
            { type: "application/ld+json" },
            JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "JavaGuide",
              alternateName: "Java 面试指南",
              url: "https://javaguide.cn/",
              inLanguage: "zh-CN",
              description:
                "JavaGuide 是一份 Java 面试和后端通用面试指南，覆盖 Java、MySQL、Redis、Spring、分布式和系统设计等核心知识。",
              publisher: {
                "@type": "Person",
                name: "Guide",
                url: "https://javaguide.cn/article/",
              },
            }),
          ]);

        if (page.path === "/home.html")
          head.push([
            "script",
            { type: "application/ld+json" },
            JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: "Java 面试核心内容",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Java 基础面试题",
                  url: "https://javaguide.cn/java/basis/java-basic-questions-01.html",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Java 集合面试题",
                  url: "https://javaguide.cn/java/collection/java-collection-questions-01.html",
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: "Java 并发面试题",
                  url: "https://javaguide.cn/java/concurrent/java-concurrent-questions-01.html",
                },
                {
                  "@type": "ListItem",
                  position: 4,
                  name: "JVM 面试题",
                  url: "https://javaguide.cn/java/jvm/memory-area.html",
                },
                {
                  "@type": "ListItem",
                  position: 5,
                  name: "Spring 面试题",
                  url: "https://javaguide.cn/system-design/framework/spring/spring-knowledge-and-questions-summary.html",
                },
                {
                  "@type": "ListItem",
                  position: 6,
                  name: "MySQL 面试题",
                  url: "https://javaguide.cn/database/mysql/mysql-questions-01.html",
                },
                {
                  "@type": "ListItem",
                  position: 7,
                  name: "Redis 面试题",
                  url: "https://javaguide.cn/database/redis/redis-questions-01.html",
                },
                {
                  "@type": "ListItem",
                  position: 8,
                  name: "系统设计面试题",
                  url: "https://javaguide.cn/system-design/system-design-questions.html",
                },
              ],
            }),
          ]);

        if (page.path === "/ai/")
          head.push([
            "script",
            { type: "application/ld+json" },
            JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: "AI 应用开发面试核心内容",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "AI 应用开发面试指南",
                  url: "https://javaguide.cn/ai/interview-questions/ai-interview-guide.html",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "大模型基础面试题",
                  url: "https://javaguide.cn/ai/interview-questions/llm-interview-questions.html",
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: "AI Agent 面试题",
                  url: "https://javaguide.cn/ai/interview-questions/agent-interview-questions.html",
                },
                {
                  "@type": "ListItem",
                  position: 4,
                  name: "RAG 面试题",
                  url: "https://javaguide.cn/ai/interview-questions/rag-interview-questions.html",
                },
                {
                  "@type": "ListItem",
                  position: 5,
                  name: "AI 系统设计面试题",
                  url: "https://javaguide.cn/ai/interview-questions/ai-system-design-interview-questions.html",
                },
                {
                  "@type": "ListItem",
                  position: 6,
                  name: "AI 应用系统设计",
                  url: "https://javaguide.cn/ai/system-design/ai-application-architecture.html",
                },
              ],
            }),
          ]);

        if (page.path === "/cs-basics/")
          head.push([
            "script",
            { type: "application/ld+json" },
            JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: "计算机基础面试核心内容",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "计算机网络常见面试题",
                  url: "https://javaguide.cn/cs-basics/network/other-network-questions.html",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "操作系统常见面试题",
                  url: "https://javaguide.cn/cs-basics/operating-system/operating-system-basic-questions-01.html",
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: "线性数据结构",
                  url: "https://javaguide.cn/cs-basics/data-structure/linear-data-structure.html",
                },
                {
                  "@type": "ListItem",
                  position: 4,
                  name: "十大经典排序算法",
                  url: "https://javaguide.cn/cs-basics/algorithms/10-classical-sorting-algorithms.html",
                },
                {
                  "@type": "ListItem",
                  position: 5,
                  name: "HTTP 与 HTTPS",
                  url: "https://javaguide.cn/cs-basics/network/http-vs-https.html",
                },
                {
                  "@type": "ListItem",
                  position: 6,
                  name: "TCP 三次握手和四次挥手",
                  url: "https://javaguide.cn/cs-basics/network/tcp-connection-and-disconnection.html",
                },
              ],
            }),
          ]);
      },
    },
    sitemap: {
      changefreq: "monthly",
    },

    // The upstream copyright plugin can throw during hydration if `#app` is unavailable.
    // Keep it disabled until the plugin adds a null-safe mount path.
    copyright: false,

    feed: {
      atom: true,
      json: true,
      rss: true,
    },

    icon: {
      assets: "iconify",
    },

    photoSwipe: false,

    // 申请到 DocSearch key 后配置上面的环境变量；在此之前关闭本地搜索索引。
    ...(docsearchOptions ? { docsearch: docsearchOptions } : {}),
    search: false,
  },
});
