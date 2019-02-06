'use strict';
const path = require('path');
global.config = require(path.resolve(process.cwd(), 'config.json'));

module.exports = {
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
	node: false
};