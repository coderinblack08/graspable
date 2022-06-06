const path = require("path");

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  globals: {
    "ts-jest": {
      diagnostics: {
        warnOnly: true,
      },
      isolatedModules: true,
      tsconfig: "<rootDir>/tsconfig.json",
    },
  },
  moduleDirectories: ["ts", ".", "node_modules"],
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(ts)$",
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  // testEnvironment: "node",
  testEnvironment: path.join(__dirname, "./prisma/prisma-test-environment.js"),
  // setupFilesAfterEnv: ["<rootDir>/src/singleton.ts"],
};
