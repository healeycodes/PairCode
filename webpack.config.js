const path = require("path");

module.exports = {
  entry: {
    room: path.resolve(__dirname, "src/room.js")
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "public/js")
  },
  module: {
    rules: [
      {
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"]
          }
        }
      }
    ]
  },
  mode: "production"
};
