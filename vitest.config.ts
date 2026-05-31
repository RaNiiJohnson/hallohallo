import { defaultExclude, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: [...defaultExclude, ".next", "dist"],
    projects: [
      {
        extends: true,
        test: {
          name: "convex",
          include: ["convex/**/*.test.{ts,js}"],
          environment: "edge-runtime",
        },
      },
      {
        extends: true,
        test: {
          name: "frontend",
          include: [
            "src/**/*.test.{ts,tsx,js,jsx}",
            "app/**/*.test.{ts,tsx,js,jsx}",
          ],
          exclude: [...defaultExclude, "convex/**"],
          environment: "jsdom",
        },
      },
    ],
  },
});
