import type { SizeLimitConfig } from "size-limit";

export default [
  {
    path: "dist/index.mjs",
    import: "{ wrap }",
    limit: "10 kB",
  },
  {
    path: "dist/index.cjs",
    import: "{ wrap }",
    limit: "10 kB",
  },
] satisfies SizeLimitConfig;
