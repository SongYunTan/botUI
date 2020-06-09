var HTMLWebpackPlugin = require('html-webpack-plugin');
var HTMLWebpackPluginConfig = new HTMLWebpackPlugin({
    template: __dirname + '/index.html',
    filename: 'index.html',
    inject: 'body'
});

module.exports = {
    entry: __dirname + '/src/index.js',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options : {
                    presets: ['@babel/preset-react', { 
                        'plugins': ['@babel/plugin-proposal-class-properties']
                    }]
                }
            }
        ]
    },
    output: {
        filename: 'transformed.js',
        path: __dirname + '/build'
    },
    plugins: [HTMLWebpackPluginConfig]
};