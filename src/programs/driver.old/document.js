const _ = require('underscore');
const utils = require('../../utils');
const helper = require('./helper');
const pmc = require('@lemonce3/pmc/src');
const events = require('@lemonce3/event-constructor/src');
const { elementWatchingList } = require('../document.select');
const agentWindow = require('../../window');

const hoverReg = /:hover/g;
const AGENT_HOVER_ATTRIBUTE_NAME = '[lc2-hover]';
const FOCUSABLE_ELEMENT = ['A', 'AREA', 'LABEL', 'INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'];

function isFocusable(tagName) {
	return FOCUSABLE_ELEMENT.indexOf(tagName) !== -1;
}

function computeAgentStyle() {
	let cssText = '';

	_.each(document.styleSheets, function (styleSheet) {
		_.each(styleSheet.rules, function (rule) {
			if (rule.selectorText && rule.selectorText.match(hoverReg)) {
				cssText += rule.cssText.replace(hoverReg, AGENT_HOVER_ATTRIBUTE_NAME);
			}
		});
	});

	return cssText;
}

if (!utils.isIE8) {
	const style = window.document.createElement('style');
	
	utils.addEventListener(document, 'readystatechange', function () {
		const body = window.document.body;
	
		style.innerHTML = computeAgentStyle();
		body.appendChild(style);
	});
}

const state = { focus: null, current: null };

function elementProxyEqual(elementProxyA, elementProxyB) {
	return elementProxyA.f === elementProxyB.f &&
		elementProxyA.e === elementProxyB.e;
}

pmc.on('driver.dispatch', function ({ elementProxy: elementId, eventType }) {
	const element = elementWatchingList[elementId];

	if (!isFocusable(element)) {
		return;
	}

	if (events.FocusEvent) {
		helper.dispatchEvent(element, new events.FocusEvent('focusin', {
			bubbles: true,
			cancelable: false
		}));
	}
});

exports.setFocus = function setFocus(elementProxy = null) {
	const { focus: oldFocus } = state;

	if (oldFocus === null && elementProxy === null) {
		return;
	}

	if (oldFocus !== null && elementProxy !== null && elementProxyEqual(oldFocus, elementProxy)) {
		return;
	}

	const { f, e } = elementProxy;

	utils.Promise.resolve().then(function () {
		return pmc.request(agentWindow.frameList[f], 'driver.dispatch', {
			elementId: e,
			eventType: 'focusout'
		});
	}).then(function () {
		if (elementProxy === null) {
			return;
		}
		
		return pmc.request(agentWindow.frameList[f], 'driver.dispatch', {
			elementId: e,
			eventType: 'focusin'
		});
	}).then(function () {
		return pmc.request(agentWindow.frameList[f], 'driver.dispatch', {
			elementId: e,
			eventType: 'blur'
		});
	}).then(function () {
		if (elementProxy === null) {
			return;
		}

		return pmc.request(agentWindow.frameList[f], 'driver.dispatch', {
			elementId: e,
			eventType: 'focus'
		});
	});
};

exports.setCurrent = function setCurrent(elementProxy) {

};

exports.getCurrent = function getCurrent() {
	return state.current;
};

exports.elementProxyFromPoint = function elementProxyFromPoint() {

};