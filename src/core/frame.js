const EventEmitter = require('eventemitter3');
const { execute } = require('./program');
const message = require('../utils/message');
const { addEventListener, XMLHttpRequest } = require('../utils/polyfill');
const _ = require('underscore');

const frame = module.exports = new EventEmitter();

_.extend(frame, {
	id: -1,
	windowId: -1,
	agentId: -1,
	elementCounter: 0,
	testing: null
});

frame.init = function initFrameWindow() {
	message.request(top, 'frame.register').then(({ data }) => updateFrame(data));
};

message.on('browser.update', data => updateFrame(data));

addEventListener(window, 'beforeunload', function () {
	message.request(top, 'frame.destroy', frame.id);
});

function updateFrame(data) {
	frame.id = data.frameId;
	frame.windowId = data.windowId;
	frame.agentId = data.agentId;

	if (frame.testing !== data.testing) {
		data.testing ? overrideWindowDialogInTesting() : overrideWindowDialog();
	}

	frame.testing = data.testing;
}

const _alert = window.alert;
const _confirm = window.confirm;
const _prompt = window.prompt;

function overrideWindowDialog() {
	window.alert = function alertProxy(message) {
		_alert(message);

		frame.emit('alert', message);
	};

	window.confirm = function confirmProxy() {
		const result = _confirm(message);

		frame.emit('confirm', message, result);

		return result;
	};

	window.prompt = function promptProxy(message, defaultValue) {
		const input = defaultValue ? _prompt(message, defaultValue) : _prompt(message);

		frame.emit('prompt', message, input);

		return input;
	};
}

function overrideWindowDialogInTesting() {
	window.alert = function alertProxy() {

	};

	window.confirm = function confirmProxy() {

	};

	window.prompt = function promptProxy() {

	};
}