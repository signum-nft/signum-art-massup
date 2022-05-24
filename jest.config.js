/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@lib/(.*)": "<rootDir>/src/lib/$1",
    "^@commands/(.*)": "<rootDir>/src/commands/$1",
  },
};
