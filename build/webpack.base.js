'use strict';

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    mode: 'production',
	entry: {
        bundle: [
            path.resolve(__dirname, '../src/index.js'),
        ]
    },
    output: {
		filename: '[name].js',
		path:path.resolve(__dirname, '../dist'),
	},
    target: 'web',
    module: {
        rules:[
            {
				test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    // 'es3ify-loader',
                    'babel-loader'
                ],

            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
			filename: 'index.html',
			template: path.resolve(__dirname, './template/index.html'),
			inject: "head"
        }),
        new UglifyJsPlugin({
            uglifyOptions: {
                compress: {
                    warnings: false
                },
                ie8: true
            }
        })
    ],
    node: false
};