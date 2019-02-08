const browser = require('./core/browser');
const frame = require('./core/frame');
const isTop = window.top === window.self;

if (isTop) {
	browser.init();
}

frame.init();

const program = require('./core/program');

const agent = module.exports = {
	underscore: require('underscore'),
	Promise: require('./utils/polyfill').Promise,
	RequestAgent: require('./utils/request'),
	EventEmitter: require('eventemitter3'),
	browser: browser,
	frame: frame,
	message: require('./utils/message'),
	extend: program.register,
	use: registerPlugin,
};

registerPlugin(require('./programs'));

function registerPlugin(install, isTop) {
	install(agent, isTop);
}