import { arraySidebar } from "vuepress-theme-hope";
import { ICONS } from "./constants.js";

export const openSourceProject = arraySidebar([
  {
    text: "技术教程",
    link: "tutorial",
    icon: ICONS.BOOK,
  },
  {
    text: "实战项目",
    link: "practical-project",
    icon: ICONS.PROJECT,
  },
  {
    text: "AI",
    link: "machine-learning",
    icon: ICONS.MACHINE_LEARNING,
  },
  {
    text: "系统设计",
    link: "system-design",
    icon: ICONS.DESIGN,
  },
  {
    text: "工具类库",
    link: "tool-library",
    icon: ICONS.LIBRARY,
  },
  {
    text: "开发工具",
    link: "tools",
    icon: ICONS.TOOL,
  },
  {
    text: "大数据",
    link: "big-data",
    icon: ICONS.BIG_DATA,
  },
]);
