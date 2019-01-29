'use strict';
const application = require('./webpack.base');

application.mode = 'development';

application.devtool = 'inline-source-map';

application.devServer = {
	port: 8003,
	hot: false,
	inline: false,
	host: '0.0.0.0',
	proxy: {
		'/api': 'http://localhost:8090'
	}
};
module.exports = application;