module.exports = {
    transform: {
        "^.+\\.js$": "babel-jest",
    },
    type: "commonjs",
    modulePathIgnorePatterns: ["<rootDir>/dist/"],
};