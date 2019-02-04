'use strict';
const webpackBase = require('./webpack.base');
const merge = require('webpack-merge');
require('./frame-server');

module.exports = merge(webpackBase, {
	mode: 'development',
	devtool: 'inline-source-map',
	devServer: {
		port: config.dev.port,
		host: '0.0.0.0',
		hot: false,
		proxy: {
			'/api': config.observer.url
		}
	}
});