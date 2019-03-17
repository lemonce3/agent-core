const _ = require('underscore');

const Promise = window.Promise || require('promise-polyfill/lib');
const XMLHttpRequest = window.XMLHttpRequest || function MicrosoftXMLHTTP() {
	return new ActiveXObject('Microsoft.XMLHTTP');
};

function addEventListener(dom, eventType, listener) {
	if (dom.addEventListener) {
		dom.addEventListener(eventType, listener, false);
	} else {
		dom.attachEvent(`on${eventType}`, listener);
	}
}

function removeEventListener(dom, eventType, listener) {
	if (dom.removeEventListener) {
		dom.removeEventListener(eventType, listener, false);
	} else {
		dom.detachEvent(`on${eventType}`, listener);
	}
}

function http(method = 'get', url = '/', { data = null, async = true, type } = {}) {
	const request = new XMLHttpRequest();
	const stringData = JSON.stringify(data);

	request.open(method, `${url}?_t=${_.now()}`, async);
	request.setRequestHeader('Content-Type', 'application/json');
	request.setRequestHeader('X-Observer-Forward', 'yes');

	if (type) {
		request.responseType = type;
	}
	
	return async ? new Promise((resolve, reject) => {
		request.onreadystatechange = function () {
			if (request.readyState !== 4) {
				return;
			}

			if (request.status === 200) {
				try {
					if (type === 'blob') {
						return resolve(request.response);
					}

					resolve(JSON.parse(request.responseText));
				} catch (error) {
					resolve(request.responseText);
				}
			} else {
				reject(request.status);
			}
		};

		request.onerror = function (error) {
			reject(error);
		};

		request.send(data && stringData);
	}) : (function () {
		const response = request.send(data && stringData);

		try {
			return JSON.parse(response);
		} catch (error) {
			return response;
		}
	}());
}

const isIE = !!window.ActiveXObject || 'ActiveXObject' in window;

function isWindowClosed(win) {
	if (win.self === top) {
		return false;
	}
	
	return isIE ? win.parent === win : win.closed;
}

function getComputedStyle(element) {
	if (element.getComputedStyle) {
		return window.getComputedStyle(element);
	} else {
		return element.currentStyle;
	}
}

function getAttributesMap(element) {
	const attributes = element.attributes;
	const length = attributes.length;
	const map = {};

	for (let index = 0; index < length; index++) {
		const { name, value } = attributes[index];

		map[name] = value;
	}

	delete map.__AGENT_ID__;

	return map;
}

function getRectOfElement(element) {
	const { top, left, bottom, right } = element.getBoundingClientRect();

	return {
		top, left, bottom, right,
		width: right - left,
		height: bottom - top
	};
}

module.exports = {
	http,
	addEventListener,
	removeEventListener,
	Promise,
	XMLHttpRequest,
	isWindowClosed,
	getAttributesMap,
	getRectOfElement,
	getComputedStyle,
	isIE8: !document.createEvent,
};

window.__http = http;