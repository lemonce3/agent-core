require('./init');

const program = require('./core/program');

const agent = module.exports = {
	underscore: require('underscore'),
	Promise: require('./utils/polyfill').Promise,
	RequestAgent: require('./utils/request'),
	EventEmitter: require('eventemitter3'),
	browser: require('./core/browser'),
	frame: require('./core/frame'),
	message: require('./utils/message'),
	use: registerPlugin,
};

registerPlugin(require('./programs/'));

function registerPlugin(install) {
	install(agent);
}