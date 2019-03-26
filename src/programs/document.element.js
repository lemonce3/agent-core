const agentWindow = require('../window');
const pmc = require('@lemonce3/pmc/src');
const _ = require('underscore');
const utils =require('../utils');
const { elementWatchingList } = require('./document.select');

pmc.on('element.css', function ({ id, nameList}) {
	return _.pick(getComputedStyle(elementWatchingList[id]), nameList);
});

agentWindow.program('document.element.css', function (elementProxy, cssStyleNameList = []) {
	const {
		f: frameId,
		e: id
	} = elementProxy;
	const frameWindow = agentWindow.frameList[frameId];

	return pmc.request(frameWindow, 'element.css', {
		id,
		nameList: cssStyleNameList
	});
});

let rectQueryCounter = 0;
const queryRegistry = {};

pmc.on('element.rect.return', function ({ rect, queryId }, source) {
	const frameElement = _.find(document.querySelectorAll('iframe,frame'), element => {
		return element.contentWindow === source;
	});

	const frameRect = utils.getRectOfElement(frameElement);

	rect.top += frameRect.top + frameElement.clientTop;
	rect.left += frameRect.left + frameElement.clientLeft;
	rect.right += frameRect.right;
	rect.bottom += frameRect.bottom;

	if (window.self !== window.top) {
		pmc.request(window.parent, 'element.rect.return', { rect, queryId});
	} else {
		queryRegistry[queryId](rect);
	}
});

pmc.on('element.rect', function ({ elementId, queryId }) {
	const rect = utils.getRectOfElement(elementWatchingList[elementId]);

	pmc.request(window.parent, 'element.rect.return', {
		rect, queryId
	});
});

agentWindow.program('document.element.rect', function (elementProxy) {
	const {
		f: frameId,
		e: elementId
	} = elementProxy;
	const frameWindow = agentWindow.frameList[frameId];

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

		pmc.request(frameWindow, 'element.rect', { elementId, queryId });
	});
});

pmc.on('element.attributes', function (elementId) {
	return utils.getAttributesMap(elementWatchingList[elementId]);
});

agentWindow.program('document.element.attributes', function (elementProxy) {
	const {
		f: frameId,
		e: id
	} = elementProxy;
	const frameWindow = agentWindow.frameList[frameId];

	return pmc.request(frameWindow, 'element.attributes', id);
});

pmc.on('element.text', function (elementId) {
	return elementWatchingList[elementId].innerText;
});

agentWindow.program('document.element.text', function (elementProxy) {
	const {
		f: frameId,
		e: id
	} = elementProxy;
	const frameWindow = agentWindow.frameList[frameId];

	return pmc.request(frameWindow, 'element.text', id);
});

pmc.on('element.action', function ({ elementId, action }) {
	return setTimeout(() => elementWatchingList[elementId][action](), 500);
});

agentWindow.program('document.element.action', function (elementProxy, action) {
	const {
		f: frameId,
		e: elementId
	} = elementProxy;
	const frameWindow = agentWindow.frameList[frameId];

	return pmc.request(frameWindow, 'element.action', { elementId, action });
});

pmc.on('element.value', function ({ elementId, value }) {
	return elementWatchingList[elementId].value = value;
});

agentWindow.program('document.element.value', function (elementProxy, value) {
	const {
		f: frameId,
		e: elementId
	} = elementProxy;
	const frameWindow = agentWindow.frameList[frameId];

	return pmc.request(frameWindow, 'element.value', { elementId, value });
});

pmc.on('element.scroll', function ({ elementId }) {
	const element = elementWatchingList[elementId];
	
	return element && element.scrollIntoView();
});

agentWindow.program('document.element.scroll', exports.scroll = function (elementProxy, value) {
	const { f: frameId, e: elementId } = elementProxy;
	const frameWindow = agentWindow.frameList[frameId];

	return pmc.request(frameWindow, 'element.scroll', { elementId, value });
});