
module.exports = function install({
	extend, underscore: _, message, Promise, frame
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

	let elementCounter = 0;

	message.on('document.select', function ({ selector, textFilter }) {
		const localSelector = selector.shift();

		if (selector.length !== 0) {
			const childFrameList = _.filter(document.querySelectorAll(localSelector), function (element) {
				return element.tagName === 'IFRAME' || element.tagName === 'FRAME';
			});

			let promise = Promise.resolve();

			_.each(childFrameList, frame => {
				promise = promise.then(function () {
					return message.request(frame.contentWindow, 'document.select', {
						selector, textFilter
					});
				});
			});
			
			message.request(window.top, 'document.select.append', childFrameList.length -1);
		} else {
			const list = [];
			const elementList = document.querySelectorAll(localSelector);

			_.each(elementList, function (element) {
				let id = element.__agentId__;

				if (id === undefined) {
					id = element.__agentId__ = elementCounter++;
				}

				if (textFilter && !_.find(element.childNodes, node => {
					return node.nodeValue && node.nodeValue.indexOf(textFilter) !== -1;
				})) {
					return;
				}

				list.push({ f: frame.id, e: id });
			});

			message.request(window.top, 'document.select.return', list);
		}
	});

	//exec({ name:'document.select', args: [['p']] })

	extend('document.select', function querySeletorAllExtended(selector, textFilter = '') {
		let counter = 1;
		let list = [];

		const promise = new Promise((resolve, reject) => {
			setTimeout(() => reject(new Error('Non end when document.select().')), 1000);

			message.on('document.select.return', function (elementList) {
				list = list.concat(elementList);
				counter--;

				if (counter === 0) {
					message.off('document.select.return');
					message.off('document.select.append');
					resolve(list);
				}
			});

			message.on('document.select.append', function (length) {
				counter += length;
			});
		});

		/**
		 * IE8's events are triggered synchronously, which may lead to to unexpected results.
		 * So message.on first then request
		 */
		message.request(window, 'document.select', {
			selector, textFilter
		}, 1000);

		return promise;
	});

	extend('document.element');
	extend('document.element.property');
	extend('document.element.css');

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