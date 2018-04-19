const { join } = require('path')

const include = join(__dirname, 'src')

module.exports = {
  entry: './src/index',
  output: {
    path: join(__dirname, 'dist'),
    libraryTarget: 'umd',
    library: 'svgson',
  },
  externals: {
    svgo: 'svgo',
  },
  devtool: 'source-map',
  module: {
    rules: [{ test: /\.js$/, loader: 'babel-loader', include }],
  },
}
