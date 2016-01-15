var webpack = require('webpack');

module.exports = {
    entry: './src/entry.js',
    output: {
        path: './dist/',
        filename: 'item.js'
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    ]
};