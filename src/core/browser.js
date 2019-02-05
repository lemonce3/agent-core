const EventEmitter = require('eventemitter3');
const _ = require('underscore');
const browserWindow = module.exports = new EventEmitter();
const { addEventListener } = require('../utils/polyfill');
const { RequestAgent } = require('../utils/request');

const httpAgent = new RequestAgent('/api/agent');

_.extend(browserWindow, {
	agentId: null,
	windowId: null,
	masterId: null,
	program: null
});

const iframeWindowList = [];
const program = {
	'lang.eval'() {

	},
	'window.form'() {

	}
};

browserWindow.init = function init() {
	if (window.top !== window.self) {
		return this.emit('ready');
	}
	
	const agent = document.createElement('iframe');
	agent.src = '/api/agent/fetch';
	agent.width = 0;
	agent.height = 0;

	addEventListener(window, 'message', function (event) {
		console.log(event)
	});

	addEventListener(window, 'beforeunload', function () {
		browserWindow.destroy();
	});

	(function tryInit() {
		if (document.body) {
			document.body.appendChild(agent);
			browserWindow.emit('ready');
		} else {
			// console.log('Too early')
			setTimeout(tryInit, 5);
		}
	}());
};

browserWindow.destroy = function destroy() {
	httpAgent.request({
		method: 'delete',
		url: `/${this.agentId}/window/${this.windowId}`
	});
};

browserWindow.isTesting = function () {
	return Boolean(this.masterId);
};

browserWindow.registerProgram = function registerProgram(name, fn) {
	if (program[name]) {
		throw new Error(`Program named ${name} has been registed.`);
	}

	program[name] = fn;
};