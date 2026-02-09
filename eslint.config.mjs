import { createRequire } from "module";

const require = createRequire(import.meta.url);
const nextConfig = require("eslint-config-next");

const config = [
  ...nextConfig,
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
  {
    rules: {
      // Disable unescaped entities rule - it's too strict for content-heavy pages
      "react/no-unescaped-entities": "off",
      // Disable img element warning - we'll address this separately
      "@next/next/no-img-element": "warn",
      // Disable React Compiler rules - they're experimental and don't affect functionality
      "react-hooks/purity": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/static-components": "off",
      "react-compiler/react-compiler": "off",
      // Allow setState in effects with proper justification
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];

export default config;
