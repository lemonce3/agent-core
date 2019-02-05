const browserWindow = require('./core/browser');
const frameWindow = require('./core/frame');

browserWindow.init();
browserWindow.on('ready', function () {
	
});

//TODO register FrameWindow