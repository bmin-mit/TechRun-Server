// @ts-check
import { antfu } from "@antfu/eslint-config";

export default antfu(
  {
    ignores: ["eslint.config.mjs"],
    typescript: {
      parserOptions: {
        project: "./tsconfig.json",
      },
      overrides: {
        "ts/no-explicit-any": "off",
        "ts/no-floating-promises": "warn",
        "ts/no-unsafe-argument": "warn",
      }
    },
    stylistic: {
      indent: 2,
      quotes: "single",
      semi: true,
    },
  },
);
