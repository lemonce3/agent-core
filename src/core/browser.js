const EventEmitter = require('eventemitter3');
const _ = require('underscore');

const { addEventListener } = require('../utils/polyfill');
const { listenMessage } = require('../utils/global');
const { RequestAgent } = require('../utils/request');

const browserWindow = module.exports = new EventEmitter();
const KEEP_ALIVE_INTERVAL = 1000;

_.extend(browserWindow, {
	agentId: null,
	windowId: null,
	masterId: null,
	program: null
});

// const iframeWindowList = [];
// const program = {
// 	'lang.eval'() {

// 	},
// 	'window.form'() {

// 	}
// };

addEventListener(window, 'beforeunload', function () {
	browserWindow.destroy();
});

browserWindow.init = function init() {
	if (window.top !== window.self) {
		return browserWindow.emit('ready');
	}

	const iframe = document.createElement('iframe');

	iframe.src = '/api/agent/fetch';
	iframe.width = 0;
	iframe.height = 0;

	/**
	 * Use to re-try for connection to observer.
	 * Be canceled when agentId was set.
	 */
	const retryWatcher = setTimeout(function () {
		cancel();
		document.body.removeChild(iframe);
		browserWindow.init();
	}, 3000);

	const cancel = listenMessage(window, function getAgentId(agentId) {
		document.body.removeChild(iframe);
		browserWindow.agentId = agentId;

		const httpAgent = new RequestAgent(`/api/agent/${agentId}`);
		
		httpAgent.request({ method: 'post', url: '/window' }).then(data => {
			const { id: windowId } = data;
			const httpAgent = browserWindow.httpAgent =
				new RequestAgent(`/api/agent/${agentId}/window/${windowId}`);

			browserWindow.windowId = windowId;

			(function keepAlive () {
				httpAgent.request().then(data => {
					// const { program } = data;
	
					// if (program) {
					// 	changeProgram(program, this);
					// }
	
					setTimeout(() => keepAlive(), KEEP_ALIVE_INTERVAL);
				}, function () {

					/**
					 * Retry when connection error.
					 */
					browserWindow.init();
				});
			}());
		});

		/**
		 * Agent id set successfully then remove message listener.
		 * Kill retry watcher.
		 */
		cancel();
		clearTimeout(retryWatcher);
	});

	/**
	 * Get agent id by iframe post-message as soon as possible.
	 */
	(function tryInit() {
		if (document.body) {
			document.body.appendChild(iframe);
			browserWindow.emit('ready');
		} else {
			setTimeout(tryInit, 5);
		}
	}());
};

browserWindow.destroy = function destroy() {
	this.httpAgent.request({ method: 'delete' });
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