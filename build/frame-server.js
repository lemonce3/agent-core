const path = require('path');
const http = require('http');
const fs = require('fs');
const template = require('es6-template-strings');
const startPort = config.frameServer.startPort;
const bundleURL = `http://${config.dev.host}:${config.dev.port}/bundle.js`;
const frameServerHost = config.frameServer.host;

const frameHTML = fs.readFileSync(path.resolve(__dirname, 'template/frame.html'), 'utf-8');
const topHTML = fs.readFileSync(path.resolve(__dirname, 'template/top.html'), 'utf-8');
const framesetHTML = fs.readFileSync(path.resolve(__dirname, 'template/frameset.html'), 'utf-8');

exports.rootFrameURL = `http://${frameServerHost}:${startPort}`;

function createFrameServer(id, frameData, callback = () => {}, frameset = false) {
	const port = startPort + id;
	const content = template(
		frameData ? (frameset ? framesetHTML : frameHTML) : topHTML,
		Object.assign({
			bundleURL, port
		}, frameData ? {
			urlA: `http://${frameServerHost}:${startPort + frameData[0]}`,
			urlB: `http://${frameServerHost}:${startPort + frameData[1]}`,
		} : {})
	);

	http.createServer((req, res) => {
		res.writeHead(200, { 'Content-Type': 'text/html' });
		res.end(content);
	}).listen(port);

	callback();
}

createFrameServer(0, [1, 2], () => {
	createFrameServer(1, [3, 4], () => {
		createFrameServer(3);
		createFrameServer(4, [7, 8], () => {
			createFrameServer(7);
			createFrameServer(8);
		}, true);
	});

	createFrameServer(2, [5, 6], () => {
		createFrameServer(5);
		createFrameServer(6);
	});
});