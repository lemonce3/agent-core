const _ = require('underscore');
const pmc = require('@lemonce3/pmc/src');
const utils = require('./utils');

const KEEP_ALIVE_INTERVAL = 2000;
const RETRY_INTERVAL = 3000;
const IS_TOP = top === self;

const frameList = [];
const programRegistry = window.__p = exports.programRegistry = {};
let windowModel = {}, nextTickList = [];

function destroyWindow() {
	utils.http('delete', `/api/window/${windowModel.id}`, { async: false });
}

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

	return new utils.Promise(function (resolve, reject) {
		$resolve = resolve;

		setTimeout(function () {
			reject(new Error('Getting agentId timeout.'));
		}, 3000);
	}).finally(function () {
		utils.removeEventListener(window, 'message', agentIdListener);
		document.body.removeChild(iframe);
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
			testing: windowModel.agent.masterId !== null
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
	utils.removeEventListener(window, 'beforeunload', destroyWindow);
	
	if (!document.body) {
		return setTimeout(init, 0);
	}

	getAgentId().then(function success(agentId) {
		return utils.http('post', '/api/window', { data: { agentId } }).then(data => {
			windowModel = data;
			utils.addEventListener(window, 'beforeunload', destroyWindow);
	
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

exports.getFrameWindow = function getFrameWindow(index) {
	return frameList[index];
};

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