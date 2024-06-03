export default {
  config: {
    default: true,
    MD003: {
      style: "atx",
    },
    MD004: {
      style: "dash",
    },
    MD010: false,
    MD013: false,
    MD024: {
      allow_different_nesting: true,
    },
    MD035: {
      style: "---",
    },
    MD036: false,
    MD040: false,
    MD045: false,
    MD046: false,
  },
  ignores: [
    "**/node_modules/**",
    // markdown import demo
    "**/*.snippet.md",
  ],
};
