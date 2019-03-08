const agentWindow = require('../window');
const _ = require('underscore');

agentWindow.program('lang.eval', function executeScript(scriptString) {
	window.eval(scriptString);
});

agentWindow.program('window.form', function submitForm(action, method, inputs) {
	const formElement = document.createElement('form');
	const keyList = _.keys(inputs);

	_.each(keyList, function (key) {
		const inputElement = document.createElement('input');
		inputElement.name = key;
		inputElement.value = inputs[key];
		inputElement.type = 'hidden';

		formElement.appendChild(inputElement);
	});

	document.body.appendChild(formElement);

	formElement.method = method;
	formElement.action = action;

	formElement.submit();
});

agentWindow.program('window.ua', function getUserAgent() {
	return window.navigator.userAgent;
});

agentWindow.program('window.cookie', function getCookie() {
	return window.document.cookie;
});

agentWindow.program('window.screenshot', function screenshot() {

});