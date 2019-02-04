const EventEmitter = require('eventemitter3');
const { Promise, addEventListener } = require('../utils/polyfill');
const { execute } = require('./program');

let programPromise = null;

function requestMessage(windowProxy, { type, args }) {
	if (programPromise) {
		throw new Error('Frame window is busy in program.');
	}

	return new Promise((resolve, reject) => {
		programPromise = { resolve, reject };

		setTimeout(() => {
			reject(new Error('Request message timeout.'));
			programPromise = null;
		}, 10000);

		windowProxy.postMessage(JSON.stringify({ request: true, type, args }), '*');
	});
};

function respondMessage(windowProxy, { returnValue, error }) {
	windowProxy.postMessage(JSON.stringify({ response: true, returnValue, error }), '*');
}

addEventListener(window, 'message', function (event) {
	if (!event.data.request) {
		return;
	}

	const { type, args } = JSON.parse(event.data);

	Promise.resolve(execute(type, args)).then(returnValue => {
		respondMessage(event.source, { returnValue });
	}, error => {
		respondMessage(event.source, { error });
	});
});

addEventListener(window, 'message', function (event) {
	if (!event.data.response) {
		return;
	}

	if (!programPromise) {
		return;
	}

	const { returnValue, error } = JSON.parse(event.data);
	
	if (error) {
		programPromise.reject(error);
	} else {
		programPromise.resolve(returnValue);
	}
	
	programPromise = null;
});

exports.FrameWindow = class FrameWindow extends EventEmitter {
	constructor({ agentId, windowId, frameId }) {
		super();

		this.agentId = null;
		this.windowId = null;
		this.frameId = null;

		this.elements = {};
		this.programRegistry = {};
		this.testing = false;
	}

	isTesting() {
		return new Promise
	}

	init() {

	}

	execute(windowProxy, type, args = []) {
		return requestMessage(windowProxy, { type, args });
	}
};

function overrideWindowDialog() {

}

function overrideWindowDialogInTesting() {

}