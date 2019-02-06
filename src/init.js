const browserWindow = require('./core/browser');
const frameWindow = require('./core/frame');

browserWindow.init();
browserWindow.on('ready', function () {
	frameWindow.init();
});

//TODO register FrameWindow