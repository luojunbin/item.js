module.exports = {
    entry: [
        './entry.js'
    ],
    output: {
        path: __dirname + '/output/',
        publicPath: "/output/",
        filename: 'result.js'
    }
};