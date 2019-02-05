const path = require('path');
const webpackBase = require('./webpack.base');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');

module.exports = merge(webpackBase, {
	mode: 'development',
	devtool: 'inline-source-map',
	devServer: {
		port: config.dev.port,
		host: '0.0.0.0',
		hot: false,
		inline: false,
		proxy: {
			'/api': config.observer.url
		}
	},
	plugins: [
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: path.resolve(__dirname, './template/index.html'),
			templateParameters: {
				frameURL: require('./frame-server').rootFrameURL
			},
			inject: 'head'
		}),
	]
});