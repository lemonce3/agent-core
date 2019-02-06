const EventEmitter = require('eventemitter3');
const _ = require('underscore');
const message = require('../utils/message');

const { addEventListener, Promise } = require('../utils/polyfill');
const { listenMessage } = require('../utils/global');
const { RequestAgent } = require('../utils/request');
const { commitProgram } = require('./program');

const browserWindow = module.exports = new EventEmitter();
const KEEP_ALIVE_INTERVAL = 1000;

browserWindow.init = function init() {
	const frameRegistry = window.a = {
		list: [],
	};
	
	_.extend(browserWindow, {
		agentId: null,
		windowId: null,
		masterId: null,
		program: null
	});

	addEventListener(window, 'beforeunload', function () {
		browserWindow.httpAgent.request({ method: 'delete' });
	});
	
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
		//TODO 最好能和message服务方法互斥。
		if (typeof agentId !== 'string') {
			return;
		}

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
					const { program } = data;
	
					if (program) {
						commitProgram(program, this);
					}
	
					setTimeout(() => keepAlive(), KEEP_ALIVE_INTERVAL);
				}, function () {

					/**
					 * Retry when connection error.
					 */
					browserWindow.init();
				});
			}());
		}).then(() => {
			setTimeout(() => browserWindow.emit('init', browserWindow), 10);
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
		} else {
			setTimeout(tryInit, 0);
		}
	}());

	message.on('frame.register', function (data, source) {
		const length = frameRegistry.list.push(source);

		return {
			frameId: length - 1,
			windowId: browserWindow.windowId,
			agentId: browserWindow.agentId
		};
	});

	message.on('frame.destroy', function (id) {
		frameRegistry.list[id] = null;
	});

	browserWindow.on('init', function () {
		/**
		 * IE8's events are triggered synchronously, which may lead to to unexpected results.
		 */
		let asyncTask = Promise.resolve();

		_.each(frameRegistry.list, (source, id) => {
			asyncTask = asyncTask.then(() => {
				message.request(source, 'agent.update', {
					frameId: id,
					windowId: browserWindow.windowId,
					agentId: browserWindow.agentId
				});
			});
		});

		browserWindow.emit('ready', browserWindow);
	});
};

browserWindow.isTesting = function () {
	return Boolean(browserWindow.masterId);
};
