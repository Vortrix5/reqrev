const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: {
        contentScript: './src/contentScript.tsx',
        background: './src/background.ts'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.jsx']
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'manifest.json',
                    to: 'manifest.json'
                },
                {
                    from: 'src/styles/reqrev.css',
                    to: 'reqrev.css'
                },
                // Copy icon files if they exist
                {
                    from: 'icons',
                    to: 'icons',
                    noErrorOnMissing: true
                }
            ]
        })
    ],
    devtool: 'cheap-module-source-map',
    watch: false
};
