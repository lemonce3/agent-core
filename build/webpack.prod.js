const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');
const webpackBase = require('./webpack.base');
const merge = require('webpack-merge');

module.exports = merge(webpackBase, {
	mode: 'none',
	plugins: [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('production')
		}),
		new UglifyJsPlugin({
			uglifyOptions: {
				compress: {
					warnings: false
				},
				ie8: true
			}
		})
	]
});
