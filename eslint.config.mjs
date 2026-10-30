import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: { boundaries },
    settings: {
      "boundaries/elements": [
        { type: "app", pattern: "src/app/**" },
        {
          type: "feature",
          pattern: "src/features/*/**",
          capture: ["featureName"],
        },
        { type: "shared", pattern: "src/components/**" },
        { type: "shared", pattern: "src/lib/**" },
        { type: "shared", pattern: "src/data/**" },
        { type: "shared", pattern: "src/i18n/**" },
        { type: "shared", pattern: "src/server/**" },
        { type: "shared", pattern: "src/types/**" },
        { type: "shared", pattern: "src/generated/**" },
      ],
    },
    rules: {
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            {
              from: "app",
              allow: ["app", "feature", "shared"],
            },
            {
              from: "feature",
              allow: [
                "shared",
                ["feature", { featureName: "${from.featureName}" }],
              ],
            },
            {
              from: "shared",
              allow: ["shared"],
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".audit/**",
    "src/generated/**",
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
