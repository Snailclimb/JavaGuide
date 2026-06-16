/**
 * 侧边栏图标常量
 * 统一管理所有侧边栏配置中使用的图标
 */
export const ICONS = {
  // 基础图标
  STAR: "mdi:star-outline",
  BASIC: "mdi:book-open-page-variant-outline",
  CODE: "mdi:code-tags",
  DESIGN: "mdi:palette-swatch-outline",
  ROADMAP: "mdi:map-outline",

  // 技术领域
  JAVA: "mdi:language-java",
  COMPUTER: "mdi:desktop-classic",
  DATABASE: "mdi:database-outline",
  NETWORK: "mdi:lan",

  // 框架和工具
  SPRING_BOOT: "mdi:leaf",
  MYBATIS: "mdi:database-cog-outline",
  NETTY: "mdi:server-network-outline",

  // 数据库
  MYSQL: "mdi:database",
  REDIS: "mdi:database-sync-outline",
  ELASTICSEARCH: "mdi:database-search-outline",
  MONGODB: "mdi:database-marker-outline",
  SQL: "mdi:database-search",

  // 开发工具
  TOOL: "mdi:tools",
  MAVEN: "mdi:package-variant-closed",
  GRADLE: "mdi:cog-outline",
  GIT: "mdi:git",
  DOCKER: "mdi:docker",
  IDEA: "mdi:application-brackets-outline",

  // 系统设计
  COMPONENT: "mdi:widgets-outline",
  CONTAINER: "mdi:cube-outline",
  SECURITY: "mdi:shield-lock-outline",

  // 分布式
  DISTRIBUTED: "mdi:transit-connection-variant",
  GATEWAY: "mdi:gate",
  ID: "mdi:identifier",
  LOCK: "mdi:lock-outline",
  TRANSACTION: "mdi:bank-transfer",
  RPC: "mdi:api",
  FRAMEWORK: "mdi:layers-outline",

  // 高性能
  PERFORMANCE: "mdi:speedometer",
  CDN: "mdi:cloud-outline",
  LOAD_BALANCING: "mdi:scale-balance",
  MQ: "mdi:message-processing-outline",

  // 高可用
  HIGH_AVAILABLE: "mdi:check-network-outline",

  // 操作系统
  OS: "mdi:desktop-classic",
  LINUX: "mdi:linux",
  VIRTUAL_MACHINE: "mdi:server",

  // 数据结构与算法
  DATA_STRUCTURE: "mdi:graph-outline",
  ALGORITHM: "mdi:chart-tree",

  // 其他
  FEATURED: "mdi:star-four-points-outline",
  INTERVIEW: "mdi:briefcase-outline",
  EXPERIENCE: "mdi:chart-timeline-variant",
  CHAT: "mdi:comment-text-outline",
  BOOK: "mdi:book-open-page-variant-outline",
  PROJECT: "mdi:projector-screen-outline",
  LIBRARY: "mdi:library-outline",
  MACHINE_LEARNING: "mdi:robot-outline",
  BIG_DATA: "mdi:database-search-outline",
  SEARCH: "mdi:magnify",
  WORK: "mdi:office-building-outline",
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
