const helper = require('./helper');
const pmc = require('@lemonce3/pmc/src');
const agentWindow = require('../../window');
const utils = require('../../utils');

const state = { button: 0, buttons: 0o000 };
const BUTTON = {
	LEFT: { ID: 0, BIT: 0o001 },
	MIDDLE: { ID: 1, BIT: 0o100 },
	RIGHT: { ID: 2, BIT: 0o010 }
};

let pointer = null;

if (top === self) {
	pointer = (function () {
		const div = document.createElement('div');
		const { style } = div;
	
		style.position = 'fixed';
		style.width = '1px';
		style.height = '1px';
		style.top = '0';
		style.left = '0';
		style.border = '2px solid #000';
		style.boxShadow = '0 0 2px 1px #000';
		style.borderRadius = '50%';
	
		setTimeout(function () {
			document.body.appendChild(div);
		}, 0);
	
		return div;
	}());

	// helper.animate({ x: 0, y: 0 }, { x: 400, y: 400 }, {
	// 	onstart: movePointer,
	// 	onmove: movePointer,
	// 	onend: movePointer
	// });
}

function movePointer ({ x, y }) {
	pointer.style.left = `${x}px`;
	pointer.style.top = `${y}px`;
}

function queryParentPath(element, parent = null) {
	const parentPath = [];

	while (element !== parent && element.parentElement !== element.ownerDocument) {
		parentPath.push(element);
		element = element.parentElement;
	}

	return parentPath;
}

function queryCommonParent(elementA, elementB) {
	if (!elementA || !elementB) {
		return document;
	}

	const parentList_0 = queryParentPath(elementA);
	const parentList_1 = queryParentPath(elementB);
	
	let parent = parentList_1.shift();
	while (parent && parentList_0.indexOf(parent) === -1) {
		parent = parentList_1.shift();
	}

	return parent;
}

function MouseEventInits(typeName, ) {
	return {

	}
}

module.exports = {
	down(elementProxy, buttonName = 'LEFT') {
		const { f, e } = elementProxy;

		state.buttons ^= BUTTON[buttonName].BIT;
		state.button = BUTTON[buttonName].ID;

		return pmc.request(agentWindow.frameList[f], 'driver.dispatch', {
			elementId: e,
			eventType: 'mousedown',
			eventInits: {

			}
		});

		//TODO 设置焦点
	},
	up(elementProxy, buttonName = 'LEFT') {
		const { f, e } = elementProxy;

		state.buttons ^= BUTTON[buttonName].BIT;
		state.button = BUTTON[buttonName].ID;

		return pmc.request(agentWindow.frameList[f], 'driver.dispatch', {
			elementId: e,
			eventType: 'mouseup',
			eventInits: {

			}
		});
	},
	click(elementProxy) {
		const { f, e } = elementProxy;

		return utils.Promise.resolve().then(function () {
			return this.down(elementProxy, 'LEFT');
		}).then(function () {
			return this.up(elementProxy, 'LEFT');
		}).then(function () {
			return pmc.request(agentWindow.frameList[f], 'driver.dispatch', {
				elementId: e,
				eventType: 'click',
				eventInits: {

				}
			});
		});
	},
	dblclick(elementProxy) {
		const { f, e } = elementProxy;

		return utils.Promise.resolve().then(function () {
			return this.click(elementProxy, 'LEFT');
		}).then(function () {
			return this.click(elementProxy, 'LEFT');
		}).then(function () {
			return pmc.request(agentWindow.frameList[f], 'driver.dispatch', {
				elementId: e,
				eventType: 'dblclick',
				eventInits: {

				}
			});
		});
	},
	contextmenu(elementProxy) {
		const { f, e } = elementProxy;

		return utils.Promise.resolve().then(function () {
			return this.down(elementProxy, 'RIGHT');
		}).then(function () {
			return this.up(elementProxy, 'RIGHT');
		}).then(function () {
			return pmc.request(agentWindow.frameList[f], 'driver.dispatch', {
				elementId: e,
				eventType: 'contextmenu',
				eventInits: {

				}
			});
		});
	},
	move(position, immediate) {

	}
};