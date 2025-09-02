module.exports = {
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleNameMapper: {
    "^src/(.*)$": "<rootDir>/$1",
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  testEnvironment: 'jsdom',
};