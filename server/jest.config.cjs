module.exports = {
    transform: {
        "^.+\\.js$": "babel-jest",
    },
    type: "commonjs",
    modulePathIgnorePatterns: ["<rootDir>/dist/"],
    maxConcurrency: 7,
    testMatch: [
        // "**/transaction.test.js",
        // "**/reply.test.js",
        // "**/order.test.js",
        // "**/product.test.js",
        // "**/cart.test.js",
        // "**/stock.test.js",
        // "**/review.test.js",
        // "**/rating.test.js",
        "**/business.test.js",
    ],
};
