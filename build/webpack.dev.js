'use strict';

const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const application = require('./webpack.base');

application.mode = 'development';

application.devtool = 'inline-source-map';

application.devServer = {
	port: 8003,
	hot: false,
	inline: false,
	host: 'localhost'
};
module.exports = application;