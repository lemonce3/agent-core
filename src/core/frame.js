const EventEmitter = require('eventemitter3');
const { execute } = require('./program');
const message = require('../utils/message');

const frame = {
	id: 0,
	windowId: -1,
	agentId: -1,
	elementCounter: 0,
	testing: false
};

message.on('agent.update', function (data) {
	frame.windowId = data.windowId;
	frame.agentId = data.agentId;
});

exports.init = function initFrameWindow() {
	message.request(top, 'frame.register').then(({ data }) => {
		frame.id = data.frameId;
		frame.windowId = data.windowId;
		frame.agentId = data.agentId;
	});
};

function overrideWindowDialog() {

}

function overrideWindowDialogInTesting() {

}