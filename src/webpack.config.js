var definePlugin = new webpack.DefinePlugin({
    __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'true')),
    __PRERELEASE__: JSON.stringify(JSON.parse(process.env.BUILD_PRERELEASE || 'false'))
});

var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('common.js');


module.exports = {
    entry: {
        index: './entry.js',
        result: './entry.js'
    },
    output: {
        path: '../dist/',
        filename: '[name].js'
    },
    plugins: [definePlugin]
};