const browserWindow = require('./core/browser');
const frameWindow = require('./core/frame');

if (window.top === window.self) {
	browserWindow.init();
}

frameWindow.init();