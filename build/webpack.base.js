'use strict';
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
global.config = require(path.resolve(process.cwd(), 'config.json'));

module.exports = {
	mode: 'production',
	entry: {
		bundle: [
			path.resolve(__dirname, '../src/index.js'),
		]
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, '../dist'),
	},
	target: 'web',
	module: {
		rules: [{
			test: /\.js$/,
			exclude: /node_modules/,
			use: [
				'babel-loader'
			],

		}]
	},
	plugins: [
		// new UglifyJsPlugin({
		//     uglifyOptions: {
		//         compress: {
		//             warnings: false
		//         },
		//         ie8: true
		//     }
		// })
	],
	node: false
};