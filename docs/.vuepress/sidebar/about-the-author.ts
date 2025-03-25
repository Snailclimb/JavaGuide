import { arraySidebar } from "vuepress-theme-hope";

export const aboutTheAuthor = arraySidebar([
  {
    text: "个人经历",
    icon: "experience",
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
    text: "杂谈",
    icon: "chat",
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
