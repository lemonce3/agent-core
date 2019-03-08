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

if (utils.isIE8) {
	document.attachEvent('onclick', function (event) {
		const { srcElement: anchor } = event;

		if (anchor.tagName === 'A' && anchor.target === '_blank') {
			event.returnValue = false;

			return window.open(anchor.href, '_blank', 'dialog=yes');
		}

		if (anchor.href === 'about:blank') {
			return event.returnValue = false;
		}
	});
} else {
	document.addEventListener('click', function (event) {
		const { target: anchor } = event;

		if (anchor.tagName === 'A' && anchor.target === '_blank') {
			event.preventDefault();

			return window.open(anchor.href, '_blank', 'dialog=yes');
		}

		if (anchor.href === 'about:blank') {
			return event.preventDefault();
		}
	}, true);
}