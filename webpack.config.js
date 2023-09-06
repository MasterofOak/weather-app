const path = require("path");

module.exports = {
    entry: "./src/index.js",
    mode: "production",
    output: {
        filename: "build.js",
        path: path.resolve(__dirname, "dist"),
    },
    watch: true,
    watchOptions: {
        aggregateTimeout: 200,
        ignored: /node_modules/, 
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
        ],
    },
};
