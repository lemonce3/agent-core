const EventEmitter = require('eventemitter3');
const message = require('../utils/message');
const { addEventListener } = require('../utils/polyfill');
const { RequestAgent } = require('../utils/request');
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
	frame.testing = data.testing;
}

const _alert = window.alert;
const _confirm = window.confirm;
const _prompt = window.prompt;

(function overrideWindowDialog() {
	window.alert = function alertProxy(message) {

		if (frame.testing) {
			const requestAgent = new RequestAgent(
				`/api/agent/${frame.agentId}/window/${frame.windowId}/dialog`);

			requestAgent.request({
				method: 'post',
				data: {
					type: 'alert',
					message,
				},
				async: false
			});
		} else {
			_alert(message);
	
			frame.emit('alert', message);
		}
	};

	window.confirm = function confirmProxy(message) {
		if (frame.testing) {
			const requestAgent = new RequestAgent(
				`/api/agent/${frame.agentId}/window/${frame.windowId}/dialog`);

			const { value } = requestAgent.request({
				method: 'post',
				data: {
					type: 'confirm',
					message,
				},
				async: false
			});
	
			return value;
		} else {
			const result = _confirm(message);
	
			frame.emit('confirm', message, result);
	
			return result;
		}
	};

	window.prompt = function promptProxy(message, defaultValue) {
		if (frame.testing) {
			const requestAgent = new RequestAgent(
				`/api/agent/${frame.agentId}/window/${frame.windowId}/dialog`);

			const { value } = requestAgent.request({
				method: 'post',
				data: {
					type: 'prompt',
					message,
				},
				async: false
			});
	
			return value;

		} else {
			const input = defaultValue ? _prompt(message, defaultValue) : _prompt(message);
	
			frame.emit('prompt', message, input);
	
			return input;
		}
	};
}());