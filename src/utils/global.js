const { addEventListener, removeEventListener } = require('./polyfill');

exports.isTop = window.top === window.self;

exports.listenMessage = function (window, listener) {
	function listenerWrap (event) {
		if (typeof event.data !== 'string') {
			return;
		}

		try {
			const data = JSON.parse(event.data);

			listener(data, event);
		} catch (error) {
			console.log(error)
			return;
		}
	}

	addEventListener(window, 'message', listenerWrap);

	return function cancel() {
		removeEventListener(window, 'message', listenerWrap);
	};
};

exports.postMessage = function (window, data) {
	window.postMessage(JSON.stringify(data), '*');
};