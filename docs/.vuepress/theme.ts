import { getDirname, path } from "vuepress/utils";
import { hopeTheme } from "vuepress-theme-hope";

import navbar from "./navbar.js";
import sidebar from "./sidebar/index.js";

const __dirname = getDirname(import.meta.url);
const siteHostname = "https://ltimax.github.io";
const repoUrl = "https://github.com/LTimax/JavaGuide";
const profileUrl = "https://github.com/LTimax";

export default hopeTheme({
  hostname: siteHostname,
  logo: "/logo.png",
  favicon: "/favicon.ico",

  author: {
    name: "Guide",
    url: repoUrl,
  },

  repo: repoUrl,
  docsDir: "docs",
  pure: true,
  focus: false,
  breadcrumb: false,
  navbar,
  sidebar,
  footer:
    '本站基于 JavaGuide fork，并部署在 GitHub Pages。',
  displayFooter: true,

  pageInfo: ["Author", "Category", "Tag", "Original", "Word", "ReadingTime"],

  blog: {
    intro: "/about-the-author/",
    medias: {
      Zhihu: "https://www.zhihu.com/people/javaguide",
      Github: profileUrl,
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
    sitemap: true,

    copyright: {
      author: "Guide (fork by LTimax)",
      license: "MIT",
      triggerLength: 100,
      maxLength: 700,
      canonical: siteHostname,
      global: true,
    },

    feed: {
      atom: true,
      json: true,
      rss: true,
    },

    icon: {
      assets: "//at.alicdn.com/t/c/font_2922463_o9q9dxmps9.css",
    },

    search: {
      isSearchable: (page) => page.path !== "/",
      maxSuggestions: 10,
    },
  },
});
