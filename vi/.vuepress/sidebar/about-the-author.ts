import { arraySidebar } from "vuepress-theme-hope";
import { ICONS } from "./constants.js";

export const aboutTheAuthor = arraySidebar([
  {
    text: "Trải nghiệm cá nhân",
    icon: ICONS.EXPERIENCE,
    collapsible: false,
    children: [
      "internet-addiction-teenager",
      "my-college-life",
      "javaguide-100k-star",
      "feelings-after-one-month-of-induction-training",
      "feelings-of-half-a-year-from-graduation-to-entry",
    ],
  },
  {
    text: "Tản mạn",
    icon: ICONS.CHAT,
    collapsible: false,
    children: [
      "writing-technology-blog-six-years",
      "deprecated-java-technologies",
      "my-article-was-stolen-and-made-into-video-and-it-became-popular",
      "dog-that-copies-other-people-essay",
      "zhishixingqiu-two-years",
    ],
  },
]);
