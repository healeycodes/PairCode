const path = require('path');

module.exports = {
  entry: {
    room: path.resolve(__dirname, 'public/js/room.js'),
    autosave: path.resolve(__dirname, 'public/js/autosave.js')
  },
  output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'public/js')
  },
  module: {
    rules: [
      {
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};
