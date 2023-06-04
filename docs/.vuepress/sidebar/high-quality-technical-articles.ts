import { arraySidebar } from "vuepress-theme-hope";

export const highQualityTechnicalArticles = arraySidebar([
  {
    text: "练级攻略",
    icon: "et-performance",
    prefix: "advanced-programmer/",
    collapsible: false,
    children: [
      "the-growth-strategy-of-the-technological-giant",
      "ten-years-of-dachang-growth-road",
      "seven-tips-for-becoming-an-advanced-programmer",
      "20-bad-habits-of-bad-programmers",
      "thinking-about-technology-and-business-after-five-years-of-work",
    ],
  },
  {
    text: "个人经历",
    icon: "experience",
    prefix: "personal-experience/",
    collapsible: false,
    children: [
      "four-year-work-in-tencent-summary",
      "two-years-of-back-end-develop--experience-in-didi-and-toutiao",
      "8-years-programmer-work-summary",
      "huawei-od-275-days",
    ],
  },
  {
    text: "程序员",
    icon: "code",
    prefix: "programmer/",
    collapsible: false,
    children: [
      "how-do-programmers-publish-a-technical-book",
      "efficient-book-publishing-and-practice-guide",
    ],
  },
  {
    text: "面试",
    icon: "interview",
    prefix: "interview/",
    collapsible: true,
    children: [
      "the-experience-of-get-offer-from-over-20-big-companies",
      "the-experience-and-thinking-of-an-interview-experienced-by-an-older-programmer",
      "technical-preliminary-preparation",
      "screen-candidates-for-packaging",
      "summary-of-spring-recruitment",
      "my-personal-experience-in-2021",
      "how-to-examine-the-technical-ability-of-programmers-in-the-first-test-of-technology",
      "some-secrets-about-alibaba-interview",
    ],
  },
  {
    text: "工作",
    icon: "work",
    prefix: "work/",
    collapsible: true,
    children: [
      "get-into-work-mode-quickly-when-you-join-a-company",
      "32-tips-improving-career",
      "employee-performance",
    ],
  },
]);
