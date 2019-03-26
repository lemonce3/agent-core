const KEY_FRAME_LENGTH = 20;
const FRAME_INTERVAL = 20;

exports.animate = function animate(from, to, { onstart, onmove, onend }) {
	const delta = {
		x: (to.x - from.x) / KEY_FRAME_LENGTH,
		y: (to.y - from.y) / KEY_FRAME_LENGTH
	};

	const current = from;
	let cycle = 0;

	onstart(current);

	(function wrap() {
		if (cycle === KEY_FRAME_LENGTH) {
			return onend(current);
		}

		current.x += delta.x;
		current.y += delta.y;
		cycle++;

		onmove(current);

		setTimeout(wrap, FRAME_INTERVAL);
	}());
};

exports.elementProxyFromPoint = function elementProxyFromPoint(left, top) {

};

exports.dispatchEvent = function dispatchEvent(dom, event) {

};