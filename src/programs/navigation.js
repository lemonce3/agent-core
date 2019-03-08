const agentWindow = require('../window');

agentWindow.program('navigation.title', function getTitle() {
	return window.document.title;
});

agentWindow.program('navigation.href', function getURL() {
	return window.document.URL;
});

agentWindow.program('navigation.to', function loadURL(href) {
	return window.location.href = href;
});

agentWindow.program('navigation.back', function loadURL() {
	return history.back();
});

agentWindow.program('navigation.forward', function loadURL() {
	return history.forward();
});

agentWindow.program('navigation.refresh', function loadURL() {
	return window.location.reload();
});