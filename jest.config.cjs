module.exports = {
  preset: "jest-expo",
  testMatch: ["<rootDir>/tests/ui/**/*.test.ts?(x)"],
  clearMocks: true,
  restoreMocks: true,
  maxWorkers: 2,
  cacheDirectory: "<rootDir>/tmp/jest-cache",
  modulePathIgnorePatterns: ["<rootDir>/tmp/", "<rootDir>/dist/"],
  moduleNameMapper: {
    "^lucide-react-native$":
      "<rootDir>/node_modules/lucide-react-native/dist/cjs/lucide-react-native.js",
  },
};
