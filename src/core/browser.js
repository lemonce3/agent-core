const browerWindow = {
	agentId: null,
	windowId: null,
	masterId: null,
	program: null
};

const iframeWindowList = [];
const programRegistry = {};

exports.init = function init() {

};

exports.isTesting = function () {
	return Boolean(browerWindow.masterId);
};