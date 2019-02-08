exports.getAttributesMap = function getAttributesMap(element) {
	const attributes = element.attributes;
	const length = attributes.length;
	const map = {};

	for (let index = 0; index < length; index++) {
		const {
			name,
			value
		} = attributes[index];

		map[name] = value;
	}

	delete map.__AGENT_ID__;

	return map;
};

exports.getComputedStyle = function getComputedStyle(element) {
	if (window.getComputedStyle) {
		return window.getComputedStyle(element);
	} else {
		return element.currentStyle;
	}
};

exports.getRectOfElement = function getRectOfElement(element) {
	const { top, left, bottom, right } = element.getBoundingClientRect();

	return {
		top, left, bottom, right,
		width: right - left,
		height: bottom - top
	};
};