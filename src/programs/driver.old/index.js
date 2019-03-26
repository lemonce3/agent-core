const events = require('@lemonce3/event-constructor/src');
const pmc = require('@lemonce3/pmc/src');
const agentWindow = require('../../window');
const frame = require('../../frame');
const utils = require('../../utils');
const _ = require('underscore');

require('./keyboard');
require('./mouse');
require('./document');

_.each([
	'click', 'dblclick', 'contextmenu',
	'down', 'up', 'move'
], function (actionName) {
	agentWindow.program(`driver.mouse.${actionName}`, function () {

	});
});

_.each([
	'down', 'up', 'press'
], function (actionName) {
	agentWindow.program(`driver.key.${actionName}`, function () {

	});
});