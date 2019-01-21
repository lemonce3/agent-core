'use strict';
const application = require('./webpack.base');

application.mode = 'development';

application.devtool = 'inline-source-map';

application.devServer = {
	port: 8003,
	hot: false,
	inline: false,
	host: '192.168.31.234',
	proxy: {
		'/api': 'http://192.168.31.234:8090'
	}
};
module.exports = application;