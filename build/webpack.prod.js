'use strict';

const webpack = require('webpack');
const application = require('./webpack.base');

application.mode = 'none';

application.plugins.push(
    // new HtmlWebpackPlugin({
	// 	filename: 'classical_ie.html',
	// 	template: path.resolve(__dirname, './index.html'),
	// 	inject: "head"
    // }),
    new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify("production")
	})
);

module.exports = application;