import { getText } from "@vuepress/helper";
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
const MIN_META_DESCRIPTION_LENGTH = 150;
const MAX_META_DESCRIPTION_LENGTH = 160;

const segmentDisplayNames = {
  ai: "AI",
  "ai-coding": "AI 编程",
  algorithms: "算法",
  basis: "基础知识",
  books: "技术书籍",
  collection: "Java 集合",
  concurrent: "Java 并发",
  "cs-basics": "计算机基础",
  "data-structure": "数据结构",
  database: "数据库",
  "distributed-process-coordination": "分布式协调",
  "distributed-system": "分布式系统",
  docker: "Docker",
  elasticsearch: "Elasticsearch",
  framework: "开发框架",
  git: "Git",
  gradle: "Gradle",
  "high-availability": "高可用",
  "high-performance": "高性能",
  "interview-preparation": "面试准备",
  io: "Java IO",
  java: "Java",
  javaguide: "JavaGuide",
  jvm: "JVM",
  "message-queue": "消息队列",
  mysql: "MySQL",
  network: "计算机网络",
  "new-features": "Java 新特性",
  "open-source-project": "开源项目",
  "operating-system": "操作系统",
  protocol: "分布式协议与算法",
  rag: "RAG",
  redis: "Redis",
  rpc: "RPC",
  security: "安全",
  sql: "SQL",
  "system-design": "系统设计",
  tools: "开发工具",
  zookeeper: "ZooKeeper",
};

const normalizeDescriptionText = (value) =>
  String(value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
};

const formatPathSegment = (segment) =>
  segmentDisplayNames[segment] ??
  decodeURIComponent(segment)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getPathTopic = (page) =>
  page.path.split("/").filter(Boolean).map(formatPathSegment).join(" / ");

const getHeaderTitles = (page) =>
  toArray(page.headers)
    .map(({ title }) => normalizeDescriptionText(title))
    .filter(Boolean)
    .slice(0, 4);

const getPageText = (page, app) =>
  normalizeDescriptionText(
    getText(
      page.data.excerpt ?? page.contentRendered ?? page.content ?? "",
      app.siteData.base,
      {
        length: 220,
        singleLine: true,
      },
    ),
  );

const trimDescription = (description) => {
  if (description.length <= MAX_META_DESCRIPTION_LENGTH) return description;

  const trimmed = description.slice(0, MAX_META_DESCRIPTION_LENGTH);
  const lastStop = Math.max(
    trimmed.lastIndexOf("。"),
    trimmed.lastIndexOf("！"),
    trimmed.lastIndexOf("？"),
    trimmed.lastIndexOf(";"),
    trimmed.lastIndexOf("；"),
  );

  if (lastStop >= MIN_META_DESCRIPTION_LENGTH - 5)
    return trimmed.slice(0, lastStop + 1);

  const lastSoftStop = Math.max(
    trimmed.lastIndexOf("，"),
    trimmed.lastIndexOf("、"),
    trimmed.lastIndexOf(","),
  );

  if (lastSoftStop >= MIN_META_DESCRIPTION_LENGTH - 5) {
    const base = trimmed.slice(0, lastSoftStop).replace(/[，、,;\s]+$/, "");
    const result = `${base}等核心内容。`;

    return result.length <= MAX_META_DESCRIPTION_LENGTH
      ? result
      : `${result.slice(0, MAX_META_DESCRIPTION_LENGTH - 1)}。`;
  }

  return `${description.slice(0, MAX_META_DESCRIPTION_LENGTH - 1)}。`;
};

const buildSeoDescription = (page, app) => {
  const existingDescription = normalizeDescriptionText(
    page.frontmatter.description,
  );

  if (existingDescription.length >= MIN_META_DESCRIPTION_LENGTH)
    return trimDescription(existingDescription);

  if (page.path === "/")
    return trimDescription(
      "JavaGuide 是一份面向 Java 后端开发者和面试准备人群的学习指南，系统覆盖 Java 基础、集合、并发、JVM、MySQL、Redis、分布式、高并发、高可用、系统设计、消息队列、计算机基础和 AI 应用开发等核心知识，适合校招社招复习、查缺补漏和规划学习路线。",
    );

  if (page.path === "/home.html")
    return trimDescription(
      "JavaGuide 首页聚合 Java 后端学习路线、核心知识体系和高频面试题入口，覆盖 Java 基础、并发、JVM、数据库、Redis、分布式、系统设计、高性能、高可用、计算机基础和 AI 应用开发，帮助读者快速定位重点内容。",
    );

  if (page.path === "/404.html")
    return trimDescription(
      "JavaGuide 页面未找到提示页，帮助读者返回 Java 面试指南、后端通用面试知识、计算机基础、数据库、Redis、分布式、系统设计和 AI 应用开发等核心内容入口，继续定位学习资料、面试题总结和实践文章。",
    );

  const title = normalizeDescriptionText(page.title);
  const category = toArray(page.frontmatter.category)
    .map(normalizeDescriptionText)
    .filter(Boolean);
  const tags = toArray(page.frontmatter.tag ?? page.frontmatter.tags)
    .map(normalizeDescriptionText)
    .filter(Boolean)
    .slice(0, 4);
  const headers = getHeaderTitles(page);
  const focusItems = [...headers, ...tags].filter(Boolean).slice(0, 5);
  const topic = getPathTopic(page) || title || category[0] || "JavaGuide";
  const pageText = getPageText(page, app);
  const parts = [
    existingDescription || (title ? `${title}：` : ""),
    focusItems.length ? `重点围绕 ${focusItems.join("、")} 等内容展开。` : "",
    `结合 JavaGuide 知识体系梳理 ${topic} 的核心概念、实践方法、常见问题和高频面试考点，覆盖原理分析、使用场景、方案对比与经验总结，适合后端开发者系统学习、面试复习、快速定位重点内容和查缺补漏。`,
    pageText && !existingDescription.includes(pageText.slice(0, 24))
      ? pageText
      : "",
  ];

  return trimDescription(
    normalizeDescriptionText(parts.filter(Boolean).join("")),
  );
};

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
      ogp: (ogp, page, app) => ({
        ...ogp,
        "og:description": buildSeoDescription(page, app),
      }),
      jsonLd: (jsonLD, page, app) => ({
        ...jsonLD,
        description: buildSeoDescription(page, app),
      }),
      customHead: (head, page, app) => {
        page.frontmatter.description = buildSeoDescription(page, app);

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
