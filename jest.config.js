module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^src/(.*)$": "<rootDir>/src/$1",
  },
  roots: ["<rootDir>/tests"],
  moduleDirectories: ["node_modules", "src"],
};
