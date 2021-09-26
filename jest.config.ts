export default {
  clearMocks: true,
  collectCoverage: false,
  collectCoverageFrom: ["<rootDir>/src/controlles/**/*.ts"],
  coverageDirectory: "__tests__/coverage",
  coverageProvider: "v8",
  coverageReporters: ["json", "lcov"],
  testMatch: ["<rootDir>/__tests__/**/*.test.ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
};
