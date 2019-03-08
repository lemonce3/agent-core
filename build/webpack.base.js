'use strict';
const path = require('path');
global.config = require(path.resolve(process.cwd(), 'config.json'));

module.exports = {
	entry: {
		bundle: [
			path.resolve('src/index.js'),
		]
	},
	output: {
		filename: '[name].js',
		path: path.resolve('dist'),
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
	node: false
};