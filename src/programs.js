const {
	getAttributesMap,
	getRectOfElement,
	getComputedStyle
} = require('./utils/element');

module.exports = function install({
	extend,
	underscore: _,
	message,
	Promise,
	frame,
	browser
}) {
	extend('lang.eval', function executeScript(scriptString) {
		window.eval(scriptString);
	});

	extend('window.form', function submitForm(action, method, inputs) {
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

	extend('window.ua', function getUserAgent() {
		return window.navigator.userAgent;
	});

	extend('window.cookie', function getCookie() {
		return window.document.cookie;
	});

	extend('window.screenshot', function screenshot() {

	});

	let elementWatchingList = [];
	//DEBUG: exec({ name:'document.select', args: [['p']] })

	message.on('document.select', function ({
		selector,
		textFilter
	}) {
		const localSelector = selector.shift();

		if (selector.length !== 0) {
			const childFrameList = _.filter(document.querySelectorAll(localSelector), function (element) {
				return element.tagName === 'IFRAME' || element.tagName === 'FRAME';
			});

			_.each(childFrameList, frame => {
				message.request(frame.contentWindow, 'document.select', {
					selector,
					textFilter
				});
			});

			message.request(window.top, 'document.select.append', childFrameList.length - 1);
		} else {
			const list = [];
			const elementList = document.querySelectorAll(localSelector);

			_.each(elementList, function (element) {
				let id = element.__AGENT_ID__;

				if (id === undefined) {
					id = element.__AGENT_ID__ = elementWatchingList.length;
					elementWatchingList.push(element);
				}

				if (textFilter && !_.find(element.childNodes, node => {
					return node.nodeValue && node.nodeValue.indexOf(textFilter) !== -1;
				})) {
					return;
				}

				list.push({
					f: frame.id,
					e: id,
					n: element.tagName,
					a: getAttributesMap(element),
					v: element.value
				});
			});

			message.request(window.top, 'document.select.return', list);
		}
	});

	extend('document.select', function querySeletorAllExtended(selector, textFilter = '') {
		let counter = 1;
		let list = [];

		const promise = new Promise((resolve, reject) => {
			const timer = setTimeout(() => reject(new Error('Non end when document.select().')), 5000);

			function returnValue() {
				if (counter === 0) {
					message.off('document.select.return');
					message.off('document.select.append');
					resolve(list);
					clearTimeout(timer);
				}
			}

			message.on('document.select.return', function (elementList) {
				list = list.concat(elementList);
				counter--;
				returnValue();
			});

			message.on('document.select.append', function (length) {
				counter += length;
				returnValue();
			});
		});

		/**
		 * IE8's events are triggered synchronously, which may lead to to unexpected results.
		 * So message.on first then request
		 */
		message.request(window, 'document.select', {
			selector,
			textFilter
		}, 1000);

		return promise;
	});

	message.on('element.css', function ({ id, nameList}) {
		return _.pick(getComputedStyle(elementWatchingList[id]), nameList);
	});

	extend('document.element.css', function (elementProxy, cssStyleNameList = []) {
		const {
			f: frameId,
			e: id
		} = elementProxy;
		const frameWindow = browser.getFrameWindow(frameId);

		return message.request(frameWindow, 'element.css', {
			id,
			nameList: cssStyleNameList
		}).then(({
			data
		}) => data);
	});

	let rectQueryCounter = 0;
	const queryRegistry = {};

	message.on('element.rect.return', function ({ rect, queryId }, source) {
		const frameElement = _.find(document.querySelectorAll('iframe,frame'), element => {
			return element.contentWindow === source;
		});

		const frameRect = getRectOfElement(frameElement);

		rect.top += frameRect.top + frameElement.clientTop;
		rect.left += frameRect.left + frameElement.clientLeft;
		rect.right += frameRect.right;
		rect.bottom += frameRect.bottom;

		if (window.self !== window.top) {
			message.request(window.parent, 'element.rect.return', { rect, queryId});
		} else {
			queryRegistry[queryId](rect);
		}
	});

	message.on('element.rect', function ({ elementId, queryId }) {
		const rect = getRectOfElement(elementWatchingList[elementId]);

		message.request(window.parent, 'element.rect.return', {
			rect, queryId
		});
	});

	extend('document.element.rect', function (elementProxy) {
		const {
			f: frameId,
			e: elementId
		} = elementProxy;
		const frameWindow = browser.getFrameWindow(frameId);

		return new Promise((resolve, reject) => {
			const queryId = rectQueryCounter++;

			const timer = setTimeout(() => {
				delete queryRegistry[queryId];
				reject(new Error('Rect query timeout'));
			}, 5000);
			
			queryRegistry[queryId] = function resolveWrap(value) {
				resolve(value);
				clearTimeout(timer);
			};

			message.request(frameWindow, 'element.rect', { elementId, queryId });
		});
	});

	message.on('element.attributes', function (elementId) {
		return getAttributesMap(elementWatchingList[elementId]);
	});

	extend('document.element.attributes', function (elementProxy) {
		const {
			f: frameId,
			e: id
		} = elementProxy;
		const frameWindow = browser.getFrameWindow(frameId);

		return message.request(frameWindow, 'element.attributes', id).then(({
			data
		}) => data);
	});

	message.on('element.text', function (elementId) {
		return elementWatchingList[elementId].innerText;
	});

	extend('document.element.text', function (elementProxy) {
		const {
			f: frameId,
			e: id
		} = elementProxy;
		const frameWindow = browser.getFrameWindow(frameId);

		return message.request(frameWindow, 'element.text', id).then(({
			data
		}) => data);
	});

	message.on('element.action', function ({ elementId, action }) {
		return elementWatchingList[elementId][action]();
	});

	extend('document.element.action', function (elementProxy, action) {
		const {
			f: frameId,
			e: elementId
		} = elementProxy;
		const frameWindow = browser.getFrameWindow(frameId);

		return message.request(frameWindow, 'element.action', {
			elementId, action
		}).then(({
			data
		}) => data);
	});

	message.on('element.value', function ({ elementId, value }) {
		return elementWatchingList[elementId].value = value;
	});

	extend('document.element.value', function (elementProxy, value) {
		const {
			f: frameId,
			e: elementId
		} = elementProxy;
		const frameWindow = browser.getFrameWindow(frameId);

		return message.request(frameWindow, 'element.value', {
			elementId, value
		}).then(({
			data
		}) => data);
	});

	extend('navigation.title', function getTitle() {
		return window.document.title;
	});

	extend('navigation.href', function getURL() {
		return window.document.URL;
	});

	extend('navigation.to', function loadURL(href) {
		return window.location.href = href;
	});

	extend('navigation.back', function loadURL() {
		return history.back();
	});

	extend('navigation.forward', function loadURL() {
		return history.forward();
	});

	extend('navigation.refresh', function loadURL() {
		return window.location.reload();
	});
};