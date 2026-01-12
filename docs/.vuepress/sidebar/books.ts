import { arraySidebar } from "vuepress-theme-hope";
import { ICONS } from "./constants.js";

export const books = arraySidebar([
  {
    text: "计算机基础",
    link: "cs-basics",
    icon: ICONS.COMPUTER,
  },
  {
    text: "数据库",
    link: "database",
    icon: ICONS.DATABASE,
  },
  {
    text: "搜索引擎",
    link: "search-engine",
    icon: ICONS.SEARCH,
  },
  {
    text: "Java",
    link: "java",
    icon: ICONS.JAVA,
  },
  {
    text: "软件质量",
    link: "software-quality",
    icon: ICONS.HIGH_AVAILABLE,
  },

  {
    text: "分布式",
    link: "distributed-system",
    icon: ICONS.DISTRIBUTED,
  },
]);
