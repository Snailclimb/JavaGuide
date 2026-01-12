/**
 * 侧边栏图标常量
 * 统一管理所有侧边栏配置中使用的图标
 */
export const ICONS = {
  // 基础图标
  STAR: "star",
  BASIC: "basic",
  CODE: "code",
  DESIGN: "design",

  // 技术领域
  JAVA: "java",
  COMPUTER: "computer",
  DATABASE: "database",
  NETWORK: "network",

  // 框架和工具
  SPRING_BOOT: "bxl-spring-boot",
  MYBATIS: "mybatis",
  NETTY: "netty",

  // 数据库
  MYSQL: "mysql",
  REDIS: "redis",
  ELASTICSEARCH: "elasticsearch",
  MONGODB: "mongodb",
  SQL: "SQL",

  // 开发工具
  TOOL: "tool",
  MAVEN: "configuration",
  GRADLE: "gradle",
  GIT: "git",
  DOCKER: "docker1",
  IDEA: "intellijidea",

  // 系统设计
  COMPONENT: "component",
  CONTAINER: "container",
  SECURITY: "security-fill",

  // 分布式
  DISTRIBUTED: "distributed-network",
  GATEWAY: "gateway",
  ID: "id",
  LOCK: "lock",
  TRANSACTION: "transanction",
  RPC: "network",
  FRAMEWORK: "framework",

  // 高性能
  PERFORMANCE: "et-performance",
  CDN: "cdn",
  LOAD_BALANCING: "fuzaijunheng",
  MQ: "MQ",

  // 高可用
  HIGH_AVAILABLE: "highavailable",

  // 操作系统
  OS: "caozuoxitong",
  LINUX: "linux",
  VIRTUAL_MACHINE: "virtual_machine",

  // 数据结构与算法
  DATA_STRUCTURE: "people-network-full",
  ALGORITHM: "suanfaku",

  // 其他
  FEATURED: "featured",
  INTERVIEW: "interview",
  EXPERIENCE: "experience",
  CHAT: "chat",
  BOOK: "book",
  PROJECT: "project",
  LIBRARY: "codelibrary-fill",
  MACHINE_LEARNING: "a-MachineLearning",
  BIG_DATA: "big-data",
  SEARCH: "search",
  WORK: "work",
} as const;

/**
 * 常用文本常量
 */
export const COMMON_TEXT = {
  IMPORTANT_POINTS: "重要知识点",
  SOURCE_CODE_ANALYSIS: "源码分析",
} as const;

/**
 * 辅助函数：创建重要知识点分组
 */
export const createImportantSection = (children: any[]) => ({
  text: COMMON_TEXT.IMPORTANT_POINTS,
  icon: ICONS.STAR,
  collapsible: true,
  children,
});

/**
 * 辅助函数：创建源码分析分组
 */
export const createSourceCodeSection = (children: any[]) => ({
  text: COMMON_TEXT.SOURCE_CODE_ANALYSIS,
  icon: ICONS.STAR,
  collapsible: true,
  children,
});
