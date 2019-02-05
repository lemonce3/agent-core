const { addEventListener, removeEventListener } = require('./polyfill');

exports.isTop = window.top === window.self;

exports.listenMessage = function (window, listener) {
	function listenerWrap (event) {
		listener(JSON.parse(event.data), event);
	}

	addEventListener(window, 'message', listenerWrap);

	return function cancel() {
		removeEventListener(window, 'message', listenerWrap);
	};
};

exports.postMessage = function (window, data) {
	window.postMessage(JSON.stringify(data), '*');
};