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
            placeholder: "Tìm kiếm JavaGuide",
          },
        },
      }
    : null;
const MIN_META_DESCRIPTION_LENGTH = 150;
const MAX_META_DESCRIPTION_LENGTH = 160;

// Các legacy URL bên dưới thuộc site gốc tiếng Trung (javaguide.cn), không tồn tại
// dưới prefix /vi/ nên không cần redirect. Giữ lại object rỗng để cấu hình plugin
// vẫn hợp lệ; thêm cặp "đường-dẫn-cũ": "đường-dẫn-mới" ở đây khi site vi đổi cấu trúc.
const legacyRedirects = {};

const segmentDisplayNames = {
  ai: "AI",
  "ai-coding": "AI Coding",
  algorithms: "Algorithm",
  basis: "Kiến thức cơ bản",
  books: "Sách kỹ thuật",
  collection: "Java Collection",
  concurrent: "Java Concurrency",
  "cs-basics": "Computer Science cơ bản",
  "data-structure": "Data Structure",
  database: "Database",
  "distributed-process-coordination": "Distributed Coordination",
  "distributed-system": "Distributed System",
  docker: "Docker",
  elasticsearch: "Elasticsearch",
  framework: "Framework",
  git: "Git",
  gradle: "Gradle",
  "high-availability": "High Availability",
  "high-performance": "High Performance",
  "interview-preparation": "Chuẩn bị phỏng vấn",
  io: "Java IO",
  java: "Java",
  javaguide: "JavaGuide",
  jvm: "JVM",
  "message-queue": "Message Queue",
  mysql: "MySQL",
  network: "Computer Network",
  "new-features": "Tính năng mới của Java",
  "open-source-project": "Project mã nguồn mở",
  "operating-system": "Operating System",
  protocol: "Giao thức & thuật toán distributed",
  rag: "RAG",
  redis: "Redis",
  rpc: "RPC",
  security: "Security",
  sql: "SQL",
  "system-design": "System Design",
  tools: "Công cụ phát triển",
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
    trimmed.lastIndexOf("."),
    trimmed.lastIndexOf("!"),
    trimmed.lastIndexOf("?"),
    trimmed.lastIndexOf(";"),
  );

  if (lastStop >= MIN_META_DESCRIPTION_LENGTH - 5)
    return trimmed.slice(0, lastStop + 1);

  const lastSoftStop = Math.max(
    trimmed.lastIndexOf(","),
    trimmed.lastIndexOf(";"),
  );

  if (lastSoftStop >= MIN_META_DESCRIPTION_LENGTH - 5) {
    const base = trimmed.slice(0, lastSoftStop).replace(/[,;\s]+$/, "");
    const result = `${base} và các nội dung cốt lõi khác.`;

    return result.length <= MAX_META_DESCRIPTION_LENGTH
      ? result
      : `${result.slice(0, MAX_META_DESCRIPTION_LENGTH - 1)}.`;
  }

  return `${description.slice(0, MAX_META_DESCRIPTION_LENGTH - 1)}.`;
};

const buildSeoDescription = (page, app) => {
  const existingDescription = normalizeDescriptionText(
    page.frontmatter.description,
  );

  if (existingDescription.length >= MIN_META_DESCRIPTION_LENGTH)
    return trimDescription(existingDescription);

  if (page.path === "/")
    return trimDescription(
      "JavaGuide là bộ hướng dẫn học dành cho Java backend developer và người chuẩn bị phỏng vấn, bao phủ có hệ thống Java Basics, Collection, Concurrency, JVM, MySQL, Redis, distributed, high concurrency, high availability, system design, message queue, computer science cơ bản và AI application development, phù hợp để ôn tập tuyển dụng, bù lỗ hổng kiến thức và lên lộ trình học.",
    );

  if (page.path === "/home.html")
    return trimDescription(
      "Trang chủ JavaGuide tập hợp lộ trình học Java backend, hệ thống kiến thức cốt lõi và lối vào các câu hỏi phỏng vấn tần suất cao, bao phủ Java Basics, Concurrency, JVM, database, Redis, distributed, system design, high performance, high availability, computer science cơ bản và AI application development, giúp người đọc nhanh chóng định vị nội dung trọng tâm.",
    );

  if (page.path === "/404.html")
    return trimDescription(
      "Trang báo không tìm thấy nội dung của JavaGuide, giúp người đọc quay lại lối vào các nội dung cốt lõi như hướng dẫn phỏng vấn Java, kiến thức phỏng vấn backend, computer science cơ bản, database, Redis, distributed, system design và AI application development, để tiếp tục tìm tài liệu học, tổng hợp câu hỏi phỏng vấn và bài viết thực hành.",
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
    existingDescription || (title ? `${title}: ` : ""),
    focusItems.length
      ? `Tập trung vào ${focusItems.join(", ")} và các nội dung liên quan. `
      : "",
    `Kết hợp hệ thống kiến thức JavaGuide để hệ thống hóa khái niệm cốt lõi, phương pháp thực hành, vấn đề thường gặp và điểm thi phỏng vấn tần suất cao của ${topic}, bao phủ phân tích nguyên lý, trường hợp sử dụng, so sánh giải pháp và tổng kết kinh nghiệm, phù hợp để backend developer học có hệ thống, ôn tập phỏng vấn và bù lỗ hổng kiến thức.`,
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
  docsDir: "vi",
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
    // Bản dịch đang tiến hành: nhiều trang trong sidebar chưa có file .md tương ứng.
    // Để "error" sẽ làm fail build. Đổi lại thành "error" khi đã dịch xong toàn bộ.
    linksCheck: {
      build: "warn",
    },
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
      canonical: "https://javaguide.cn/vi",
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
              alternateName: "Hướng dẫn phỏng vấn Java",
              url: "https://javaguide.cn/vi/",
              inLanguage: "vi-VN",
              description:
                "JavaGuide là bộ hướng dẫn phỏng vấn Java và phỏng vấn backend, bao phủ các kiến thức cốt lõi như Java, MySQL, Redis, Spring, distributed và system design.",
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
              name: "Nội dung cốt lõi phỏng vấn Java",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Câu hỏi phỏng vấn Java Basics",
                  url: "https://javaguide.cn/vi/java/basis/java-basic-questions-01.html",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Câu hỏi phỏng vấn Java Collection",
                  url: "https://javaguide.cn/vi/java/collection/java-collection-questions-01.html",
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: "Câu hỏi phỏng vấn Java Concurrency",
                  url: "https://javaguide.cn/vi/java/concurrent/java-concurrent-questions-01.html",
                },
                {
                  "@type": "ListItem",
                  position: 4,
                  name: "Câu hỏi phỏng vấn JVM",
                  url: "https://javaguide.cn/vi/java/jvm/memory-area.html",
                },
                {
                  "@type": "ListItem",
                  position: 5,
                  name: "Câu hỏi phỏng vấn Spring",
                  url: "https://javaguide.cn/vi/system-design/framework/spring/spring-knowledge-and-questions-summary.html",
                },
                {
                  "@type": "ListItem",
                  position: 6,
                  name: "Câu hỏi phỏng vấn MySQL",
                  url: "https://javaguide.cn/vi/database/mysql/mysql-questions-01.html",
                },
                {
                  "@type": "ListItem",
                  position: 7,
                  name: "Câu hỏi phỏng vấn Redis",
                  url: "https://javaguide.cn/vi/database/redis/redis-questions-01.html",
                },
                {
                  "@type": "ListItem",
                  position: 8,
                  name: "Câu hỏi phỏng vấn System Design",
                  url: "https://javaguide.cn/vi/system-design/system-design-questions.html",
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
              name: "Nội dung cốt lõi phỏng vấn AI Application Development",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Hướng dẫn phỏng vấn AI Application Development",
                  url: "https://javaguide.cn/vi/ai/interview-questions/ai-interview-guide.html",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Câu hỏi phỏng vấn nền tảng LLM",
                  url: "https://javaguide.cn/vi/ai/interview-questions/llm-interview-questions.html",
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: "Câu hỏi phỏng vấn AI Agent",
                  url: "https://javaguide.cn/vi/ai/interview-questions/agent-interview-questions.html",
                },
                {
                  "@type": "ListItem",
                  position: 4,
                  name: "Câu hỏi phỏng vấn RAG",
                  url: "https://javaguide.cn/vi/ai/interview-questions/rag-interview-questions.html",
                },
                {
                  "@type": "ListItem",
                  position: 5,
                  name: "Câu hỏi phỏng vấn AI System Design",
                  url: "https://javaguide.cn/vi/ai/interview-questions/ai-system-design-interview-questions.html",
                },
                {
                  "@type": "ListItem",
                  position: 6,
                  name: "System Design cho ứng dụng AI",
                  url: "https://javaguide.cn/vi/ai/system-design/ai-application-architecture.html",
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
              name: "Nội dung cốt lõi phỏng vấn Computer Science",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Câu hỏi phỏng vấn Computer Network thường gặp",
                  url: "https://javaguide.cn/vi/cs-basics/network/other-network-questions.html",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Câu hỏi phỏng vấn Operating System thường gặp",
                  url: "https://javaguide.cn/vi/cs-basics/operating-system/operating-system-basic-questions-01.html",
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: "Linear Data Structure",
                  url: "https://javaguide.cn/vi/cs-basics/data-structure/linear-data-structure.html",
                },
                {
                  "@type": "ListItem",
                  position: 4,
                  name: "Mười thuật toán sắp xếp kinh điển",
                  url: "https://javaguide.cn/vi/cs-basics/algorithms/10-classical-sorting-algorithms.html",
                },
                {
                  "@type": "ListItem",
                  position: 5,
                  name: "HTTP và HTTPS",
                  url: "https://javaguide.cn/vi/cs-basics/network/http-vs-https.html",
                },
                {
                  "@type": "ListItem",
                  position: 6,
                  name: "TCP three-way handshake và four-way handshake",
                  url: "https://javaguide.cn/vi/cs-basics/network/tcp-connection-and-disconnection.html",
                },
              ],
            }),
          ]);
      },
    },
    sitemap: {
      changefreq: "monthly",
    },

    redirect: {
      config: legacyRedirects,
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

    // Sau khi xin được DocSearch key thì cấu hình các biến môi trường ở trên; trước đó tắt index tìm kiếm cục bộ.
    ...(docsearchOptions ? { docsearch: docsearchOptions } : {}),
    search: false,
  },
});
