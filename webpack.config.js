/* globals module */
module.exports = {
  entry: "./javascripts/app.js",
  output: {
    path: "./public/js/",
    filename: "scripts.js"
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: "babel",
        exclude: /(node_modules)/,
        query: {
          presets: ["es2015"]
        }
      }
    ]
  },
  resolve: {
    root: [
      __dirname + "/javascripts/src"
    ]
  },
  externals: {
    "jquery": "jQuery"
  }
}
