const path = require("path");

module.exports = {
  entry: "./index.js", // Your entry file
  output: {
    filename: "bundle.js", // Output file name
    path: path.resolve(__dirname, "dist"), // Output directory
    libraryTarget: "commonjs", // Output format
  },
  // Other webpack configurations...
};
