/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest", // <-- important for TS
  testEnvironment: "jsdom", // for React components; use 'node' for pure utils
  moduleNameMapper: {
    "^~/(.*)$": "<rootDir>/src/$1", // for your "~/*" paths in tsconfig
  },
};
