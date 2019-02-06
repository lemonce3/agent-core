const EventEmitter = require('eventemitter3');
const { execute } = require('./program');
const message = require('../utils/message');
const { addEventListener } = require('../utils/polyfill');

const frame = {
	id: -1,
	windowId: -1,
	agentId: -1,
	elementCounter: 0,
	testing: false
};

message.on('agent.update', function (data) {
	frame.windowId = data.windowId;
	frame.agentId = data.agentId;
	frame.id = data.frameId;
});

exports.init = function initFrameWindow() {
	message.request(top, 'frame.register').then(({ data }) => {
		frame.id = data.frameId;
		frame.windowId = data.windowId;
		frame.agentId = data.agentId;
	});
};

addEventListener(window, 'beforeunload', function () {
	message.request(top, 'frame.destroy', frame.id);
});

setTimeout(() => {
	console.log(frame.windowId, frame.id, document.title);

}, 3000);

function overrideWindowDialog() {

}

function overrideWindowDialogInTesting() {

}