const agentWindow = require('../window');

function timeoutWrap(callback) {
	return function () {
		const args = arguments;

		agentWindow.nextTick(function () {
			agentWindow.nextTick(function () {
				callback.apply(null, args);
			});
		});
	
		return true;
	};
}

agentWindow.program('navigation.to', timeoutWrap(function (href) {
	window.location.href = href;
}));

agentWindow.program('navigation.back', timeoutWrap(function () {
	history.back();
}));

agentWindow.program('navigation.forward', timeoutWrap(function () {
	history.forward();
}));

agentWindow.program('navigation.refresh', timeoutWrap(function () {
	window.location.reload();
}));