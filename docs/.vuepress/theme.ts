import { getDirname, path } from "@vuepress/utils";
import { hopeTheme } from "vuepress-theme-hope";
import { componentsPlugin } from "vuepress-plugin-components";

import navbar from "./navbar.js";
import sidebar from "./sidebar/index.js";

const __dirname = getDirname(import.meta.url);

export default hopeTheme({
  hostname: "https://javaguide.cn/",
  logo: "/logo.png",
  favicon: "/favicon.ico",

  iconAssets: "//at.alicdn.com/t/c/font_2922463_o9q9dxmps9.css",

  author: {
    name: "Guide",
    url: "https://javaguide.cn/article/",
  },

  repo: "https://github.com/Snailclimb/JavaGuide",
  docsDir: "docs",
  // 纯净模式：https://theme-hope.vuejs.press/zh/guide/interface/pure.html
  pure: true,
  breadcrumb: false,
  navbar,
  sidebar,
  footer:
    '<a href="https://beian.miit.gov.cn/" target="_blank">鄂ICP备2020015769号-1</a>',
  displayFooter: true,

  pageInfo: [
    "Author",
    "Category",
    "Tag",
    // "Date",
    "Original",
    "Word",
    "ReadingTime",
  ],

  blog: {
    intro: "/about-the-author/",
    sidebarDisplay: "mobile",
    medias: {
      Zhihu: "https://www.zhihu.com/people/javaguide",
      Github: "https://github.com/Snailclimb",
      Gitee: "https://gitee.com/SnailClimb",
    },
  },

  plugins: {
    components: {
      rootComponents: {
        // https://plugin-components.vuejs.press/zh/guide/utilities/notice.html#%E7%94%A8%E6%B3%95
        notice: [
          {
            path: "/",
            title: "Java学习路线最新版",
            showOnce: true,
            content:
              "花了一个月零碎的时间，我根据当下 Java 后端求职和招聘的最新要求，对之前写的 Java 后端学习路线进行了全面的优化和改进。这可能是你所见过的最用心、最全面的 Java 后端学习路线，共 4w+ 字。",
            actions: [
              {
                text: "免费获取",
                link: "https://mp.weixin.qq.com/s/6nWgi22UT5Y7nJiPfQ_XIw",
                type: "primary",
              },
            ],
          },
        ],
      },
    },
    blog: true,
    copyright: {
      author: "JavaGuide(javaguide.cn)",
      license: "MIT",
      triggerLength: 100,
      maxLength: 700,
      canonical: "https://javaguide.cn/",
      global: true,
    },

    feed: {
      atom: true,
      json: true,
      rss: true,
    },

    mdEnhance: {
      align: true,
      codetabs: true,
      figure: true,
      gfm: true,
      hint: true,
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

    search: {
      isSearchable: (page) => page.path !== "/",
      maxSuggestions: 10,
    },
  },
});
