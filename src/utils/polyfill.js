exports.Promise = window.Promise || require('promise-polyfill/lib');

exports.XMLHttpRequest = window.XMLHttpRequest || function MicrosoftXMLHTTP() {
	return new ActiveXObject('Microsoft.XMLHTTP');
};

exports.addEventListener = function (element, eventType, listener) {
	if (element.addEventListener) {
		element.addEventListener(eventType, listener, false);
	} else {
		element.attachEvent(`on${eventType}`, listener);
	}
};

exports.removeEventListener = function (element, eventType, listener) {
	if (element.removeEventListener) {
		element.removeEventListener(eventType, listener, false);
	} else {
		element.detachEvent(`on${eventType}`, listener, false);
	}
};

exports.getComputedStyle = function getComputedStyle(element) {
	if (element.getComputedStyle) {
		return window.getComputedStyle(element);
	} else {
		return element.currentStyle;
	}
};