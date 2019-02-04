'use strict';

const webpack = require('webpack');
const application = require('./webpack.base');

application.mode = 'none';

application.plugins.push(
	new webpack.DefinePlugin({
		"process.env.NODE_ENV": JSON.stringify("production")
	})
);

module.exports = application;