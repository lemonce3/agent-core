const EventEmitter = require('eventemitter3');
const _ = require('underscore');
const message = require('../utils/message');

const { addEventListener, Promise } = require('../utils/polyfill');
const { listenMessage } = require('../utils/global');
const { RequestAgent } = require('../utils/request');
const { execute } = require('./program');

const browser = module.exports = new EventEmitter();
const KEEP_ALIVE_INTERVAL = 1000;

const frameRegistry = {
	list: [],
};

browser.getFrameWindow = function getFrameWindow(index) {
	return frameRegistry.list[index];
};

browser.init = function init() {
	
	_.extend(browser, {
		agentId: null,
		windowId: null,
		masterId: null,
		program: null
	});

	addEventListener(window, 'beforeunload', function () {
		browser.httpAgent.request({ method: 'delete' });
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
		browser.init();
	}, 3000);

	const cancel = listenMessage(window, function getAgentId(agentId) {
		//TODO 最好能和message服务方法互斥。
		if (typeof agentId !== 'string') {
			return;
		}

		document.body.removeChild(iframe);
		browser.agentId = agentId;

		const httpAgent = new RequestAgent(`/api/agent/${agentId}`);
		
		httpAgent.request({ method: 'post', url: '/window' }).then(data => {
			const { id: windowId } = data;
			const httpAgent = browser.httpAgent =
				new RequestAgent(`/api/agent/${agentId}/window/${windowId}`);

			browser.windowId = windowId;

			let isBusy = false;

			(function keepAlive () {
				httpAgent.request({ method: 'put' }).then(data => {
					const { program, masterId } = data;

					/**
					 * Update frame when master binded.
					 */
					if (browser.masterId !== masterId) {
						browser.masterId = masterId;
						updataBrowser();
					}

					if (program && !isBusy) {
						isBusy = true;

						const exitData = {
							returnValue: undefined,
							error: null
						};

						execute(program).then(returnValue => {
							exitData.returnValue = returnValue;
						}, error => {
							exitData.error = { message: error.message };
						}).finally(() => httpAgent.request({
							method: 'post',
							url: `/program/${program.id}/exit`,
							data: exitData
						})).then(() => isBusy = false);
					}
	
					setTimeout(() => keepAlive(), KEEP_ALIVE_INTERVAL);
				}, function () {

					/**
					 * Retry when connection error.
					 */
					browser.init();
				});
			}());
		}).then(() => {
			setTimeout(updataBrowser, 10);
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
			windowId: browser.windowId,
			agentId: browser.agentId,
			testing: false
		};
	});

	message.on('frame.destroy', function (id) {
		frameRegistry.list[id] = null;
	});

	function updataBrowser() {
		/**
		 * IE8's events are triggered synchronously, which may lead to to unexpected results.
		 */
		_.each(frameRegistry.list, (source, id) => {
			message.request(source, 'browser.update', {
				frameId: id,
				windowId: browser.windowId,
				agentId: browser.agentId,
				testing: Boolean(browser.masterId)
			});
		});
	}
};