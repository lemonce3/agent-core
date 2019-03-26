const agentWindow = require('../window');
const pmc = require('@lemonce3/pmc/src');
const frame = require('../frame');
const _ = require('underscore');
const parentWindow = window.parent;

const elementWatchingList = exports.elementWatchingList = [];
// __p["document.select"](['#abc', 'iframe']).then(console.log)

pmc.on('frame.document.select', function ({ selector, textFilter }) {
	const localSelector = selector.pop();

	if (selector.length !== frame.deepth) {
		return [];
	}

	return pmc.request(parentWindow, 'frame.document.selected', selector).then(inChain => {
		if (!inChain) {
			return [];
		}

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
				t: element.type,
				v: element.value,
				c: element.checked
			});
		});
		
		return list;
	});
});

pmc.on('frame.document.selected', function (selector, source) {
	if (selector.length === 0) {
		return true;
	}

	const elementList = _.filter(document.querySelectorAll(selector.pop()), function (element) {
		return element.tagName === 'IFRAME' || element.tagName === 'FRAME';
	});

	if (_.find(elementList, frameElement => frameElement.contentWindow === source)) {
		return pmc.request(parentWindow, 'frame.document.selected', selector);
	}

	return false;
});

agentWindow.program('document.select', function querySeletorAllExtended(selector, textFilter = '') {
	return agentWindow.eachFrame(function (source) {
		return pmc.request(source, 'frame.document.select', { selector, textFilter });
	}).then(dataList => _.flatten(dataList));
});