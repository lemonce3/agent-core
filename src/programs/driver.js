const agentWindow = require('../window');
const pmc = require('@lemonce3/pmc/src');
const events = require('@lemonce3/event-constructor/src');
const { elementWatchingList } = require('./document.select');

agentWindow.program('driver.mouse', function (elementProxy, actionName, eventInits) {
	const frame = agentWindow.frameList[elementProxy.f];

	return pmc.request(frame, `driver.action.mouse.${actionName}`, {
		elementId: elementProxy.e,
		eventInits
	});
});

function dispatchEvent(element, event) {
	if (element.dispatchEvent) {
		element.dispatchEvent(event);
	} else {
		element.fireEvent(`on${event.eventType}`, event);
	}
}

const MOUSE_ACTION = {
	down(element, eventInits) {
		dispatchEvent(element, new events.MouseEvent('mousedown', eventInits));
	},
	up(element, eventInits) {
		dispatchEvent(element, new events.MouseEvent('mousedown', eventInits));
	},
	click(element, eventInits) {
		eventInits.button = 0;
		eventInits.buttons = 0o001;

		this.down(element, eventInits);
		this.up(element, eventInits);
		
		dispatchEvent(element, new events.MouseEvent('click', eventInits));
	},
	dblclick(element, eventInits) {
		this.click(element, eventInits);
		this.click(element, eventInits);
	},
	contextmenu(element, eventInits) {
		eventInits.button = 2;
		eventInits.buttons = 0o010;

		this.down(element, eventInits);
		this.up(element, eventInits);
		
		dispatchEvent(element, new events.MouseEvent('contextmenu', eventInits));
	}
}

pmc.on('driver.action.mouse', function ({ action, elementId, eventInits}) {
	const element = elementWatchingList[elementId];

	if (!element) {
		throw new Error('Element is NOT found.');
	}

	MOUSE_ACTION[action](element, eventInits);
});