import { arraySidebar } from "vuepress-theme-hope";
import { ICONS } from "./constants.js";

export const books = arraySidebar([
  {
    text: "Computer Science cơ bản",
    link: "cs-basics",
    icon: ICONS.COMPUTER,
  },
  {
    text: "Database",
    link: "database",
    icon: ICONS.DATABASE,
  },
  {
    text: "Search Engine",
    link: "search-engine",
    icon: ICONS.SEARCH,
  },
  {
    text: "Java",
    link: "java",
    icon: ICONS.JAVA,
  },
  {
    text: "Chất lượng phần mềm",
    link: "software-quality",
    icon: ICONS.HIGH_AVAILABLE,
  },

  {
    text: "Distributed",
    link: "distributed-system",
    icon: ICONS.DISTRIBUTED,
  },
]);
