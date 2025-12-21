export default {
    testEnvironment: "node",
    setupFilesAfterEnv: [
        "<rootDir>/tests/setupMocks.js",  // Mock primero
        "<rootDir>/tests/setup.js",       // Luego DB
    ],
    testTimeout: 30000,
    transform: {},
    transformIgnorePatterns: [
        "node_modules/(?!uuid|agenda|@sendgrid/mail/)"
    ],
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
};