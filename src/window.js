const _ = require('underscore');
const pmc = require('@lemonce3/pmc/src');
const utils = require('./utils');

const KEEP_ALIVE_INTERVAL = 50;
const RETRY_INTERVAL = 3000;
const IS_TOP = top === self;

const frameList= window.__f = exports.frameList = [];
const programRegistry = window.__p = exports.programRegistry = {};

let windowModel = {
	meta: {
		title: document.title,
		URL: window.location.href,
		referrer: document.referrer,
		domain: document.domain
	},
	rect: {
		width: document.documentElement.clientWidth,
		height: document.documentElement.clientHeight,
		top: 0,
		left: 0
	}
};

let nextTickList = [];

function getAgentId() {
	const iframe = document.createElement('iframe');
	
	iframe.src = '/api/agent.html';
	iframe.width = 0;
	iframe.height = 0;
	
	let $resolve;
	function agentIdListener(event) {
		try {
			const agentId = JSON.parse(event.data).agentId;
			if (agentId !== undefined) {
				$resolve(agentId);
			}
		} catch (error) {
			return;
		}
	}

	utils.addEventListener(window, 'message', agentIdListener);
	document.body.appendChild(iframe);

	function destroy() {
		utils.removeEventListener(window, 'message', agentIdListener);
		document.body.removeChild(iframe);
	}

	return new utils.Promise(function (resolve, reject) {
		$resolve = resolve;

		setTimeout(function () {
			reject(new Error('Getting agentId timeout.'));
		}, 3000);
	}).then(function (data) {
		destroy();
		return data;
	}, function (error) {
		destroy();
		throw error;
	});
}

function eachFrame(callback) {
	const promiseList = [];

	_.each(frameList, (source, id) => {
		!utils.isWindowClosed(source) && promiseList.push(callback(source, id));
	});

	return utils.Promise.all(promiseList);
}

function updataWindow() {
	eachFrame((source, id) => {
		pmc.request(source, 'window.update', {
			frameId: id,
			windowId: windowModel.id,
			testing: windowModel.agent.masterId
		});
	});
}

pmc.on('frame.register', function (data, source) {
	return {
		frameId: frameList.push(source) - 1,
		windowId: windowModel.id,
		testing: false
	};
});

function init() {
	if (!document.body) {
		return setTimeout(init, 0);
	}

	getAgentId().then(function success(agentId) {
		return utils.http('post', '/api/window', {
			data: {
				agentId,
				doc: windowModel.doc,
				meta: windowModel.meta,
				rect: windowModel.rect
			}
		}).then(data => {
			windowModel = data;
			utils.http('DELETE', `/api/window/${windowModel.id}`).catch(function () {});
	
			(function keepAlive () {
				utils.http('put', `/api/window/${windowModel.id}`, {
					data: windowModel
				}).then(data => {
					const currentTick = nextTickList;
	
					nextTickList = [];
					_.each(currentTick, callback => callback(data));
					windowModel = data;
					updataWindow();
	
					setTimeout(keepAlive, KEEP_ALIVE_INTERVAL);
				}, init);
			}());
		});
	}, function error() {
		setTimeout(init, RETRY_INTERVAL);
	});
}

if (IS_TOP) {
	init();
}

exports.nextTick = function (fn) {
	nextTickList.push(fn);
};

exports.eachFrame = eachFrame;

exports.program = function registerProgram(name, fn) {
	if (!IS_TOP) {
		return;
	}

	if (programRegistry[name]) {
		throw new Error(`Program named ${name} has been registed.`);
	}

	programRegistry[name] = fn;
};