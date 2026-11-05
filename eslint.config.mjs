import expo from "eslint-config-expo/flat.js";
import architecture from "./scripts/eslint-architecture.mjs";

const typescript = expo.find((configuration) => configuration.plugins?.["@typescript-eslint"]);
if (!typescript) throw new Error("Configuração TypeScript do Expo não encontrada.");

export default [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "functions/lib/**",
      "tmp/**",
      "output/**",
      ".expo/**",
      ".codex-*/**",
    ],
  },
  ...expo,
  {
    files: ["scripts/**/*.cjs", "functions/scripts/**/*.cjs"],
    languageOptions: { globals: { __dirname: "readonly", __filename: "readonly" } },
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx,mts}"],
    plugins: { architecture },
    rules: {
      "architecture/boundaries": "error",
    },
  },
  {
    ...typescript,
    files: ["**/*.{ts,tsx,mts,cts}"],
    rules: { ...typescript.rules, "@typescript-eslint/no-explicit-any": "error" },
  },
];
