const pmc = require('@lemonce3/pmc/src');
const _ = require('underscore');
const utils = require('./utils');

const frame = module.exports = { id: null, windowId: null, testing: null, deepth: 0 };

let currentWindow = window.self;

while (currentWindow !== window.top) {
	frame.deepth++;
	currentWindow = currentWindow.parent;
}

pmc.request(top, 'frame.register');
pmc.on('window.update', function (data) {
	frame.id = data.frameId;
	frame.windowId = data.windowId;
	frame.testing = data.testing;
});

_.each(['alert', 'confirm', 'prompt'], function (type) {
	const native = window[type];

	window[type] = function (message) {
		if (frame.testing) {
			return utils.http('post', `/api/window/${frame.windowId}/dialog`, {
				data: { type, message },
				async: false
			});
		} else {
			const value = native.apply(window, arguments);

			pmc.request(top, `dialog.open.${type}`, { message, value });

			return value;
		}
	};
});