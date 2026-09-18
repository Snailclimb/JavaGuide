/**
 * Hằng số icon cho sidebar
 * Quản lý tập trung toàn bộ icon dùng trong cấu hình sidebar
 */
export const ICONS = {
  // Icon cơ bản
  STAR: "mdi:star-outline",
  BASIC: "mdi:book-open-page-variant-outline",
  CODE: "mdi:code-tags",
  DESIGN: "mdi:palette-swatch-outline",
  ROADMAP: "mdi:map-outline",

  // Lĩnh vực kỹ thuật
  JAVA: "mdi:language-java",
  COMPUTER: "mdi:desktop-classic",
  DATABASE: "mdi:database-outline",
  NETWORK: "mdi:lan",

  // Framework và công cụ
  SPRING_BOOT: "mdi:leaf",
  MYBATIS: "mdi:database-cog-outline",
  NETTY: "mdi:server-network-outline",

  // Database
  MYSQL: "mdi:database",
  REDIS: "mdi:database-sync-outline",
  ELASTICSEARCH: "mdi:database-search-outline",
  MONGODB: "mdi:database-marker-outline",
  SQL: "mdi:database-search",

  // Công cụ phát triển
  TOOL: "mdi:tools",
  MAVEN: "mdi:package-variant-closed",
  GRADLE: "mdi:cog-outline",
  GIT: "mdi:git",
  DOCKER: "mdi:docker",
  IDEA: "mdi:application-brackets-outline",

  // System Design
  COMPONENT: "mdi:widgets-outline",
  CONTAINER: "mdi:cube-outline",
  SECURITY: "mdi:shield-lock-outline",

  // Distributed
  DISTRIBUTED: "mdi:transit-connection-variant",
  GATEWAY: "mdi:gate",
  ID: "mdi:identifier",
  LOCK: "mdi:lock-outline",
  TRANSACTION: "mdi:bank-transfer",
  RPC: "mdi:api",
  FRAMEWORK: "mdi:layers-outline",

  // High Performance
  PERFORMANCE: "mdi:speedometer",
  CDN: "mdi:cloud-outline",
  LOAD_BALANCING: "mdi:scale-balance",
  MQ: "mdi:message-processing-outline",

  // High Availability
  HIGH_AVAILABLE: "mdi:check-network-outline",

  // Operating System
  OS: "mdi:desktop-classic",
  LINUX: "mdi:linux",
  VIRTUAL_MACHINE: "mdi:server",

  // Data Structure và Algorithm
  DATA_STRUCTURE: "mdi:graph-outline",
  ALGORITHM: "mdi:chart-tree",

  // Khác
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
 * Hằng số text thường dùng
 */
export const COMMON_TEXT = {
  IMPORTANT_POINTS: "Điểm kiến thức quan trọng",
  SOURCE_CODE_ANALYSIS: "Phân tích source code",
} as const;

/**
 * Hàm hỗ trợ: tạo nhóm "Điểm kiến thức quan trọng"
 */
export const createImportantSection = (children: any[]) => ({
  text: COMMON_TEXT.IMPORTANT_POINTS,
  icon: ICONS.STAR,
  collapsible: true,
  children,
});

/**
 * Hàm hỗ trợ: tạo nhóm "Phân tích source code"
 */
export const createSourceCodeSection = (children: any[]) => ({
  text: COMMON_TEXT.SOURCE_CODE_ANALYSIS,
  icon: ICONS.STAR,
  collapsible: true,
  children,
});
