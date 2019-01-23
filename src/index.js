require('../test/click')(); //测试代码，可删

const BrowserWindow = require('./element/browserWindow');
const FrameWindow = require('./element/frameWindow');

const {addListener, removeListener, parseObj} = require('./utils/polyfill');
const post = require('./utils/postMessage');

const {frameListLength} = require('./constants');

const _ = require('underscore');

if (top === self) {
    const browserWindow = new BrowserWindow(window);
    const mapping = require('./register/browserWindow')(browserWindow);

    browserWindow.init();

    window.onunload = function () {
        browserWindow.destroy();
    }
    
    window.onbeforeunload = function () {
        browserWindow.destroy();
    }

    addListener(top, 'message', function (event) {
        const { namespace, type, args } = parseObj(event.data);

        mapping[namespace][type].call(browserWindow, args, event);

        console.log(browserWindow.frameTree);
    });

} else {
    const frameWindow = new FrameWindow(window);
    
    const mapping = require('./register/frameWindow')(frameWindow);

    post(parent, {
        namespace: 'frameWindow',
        type: 'setWindowId',
        args: {
            windowId: frameWindow.symbol
        }
    });

    addListener(window, 'load', function startSignIn() {
        if (frameListLength() === 0) {
            frameWindow.signIn();
        }

        removeListener(window, 'load', startSignIn);
    });

    window.onunload = function () {
        post(parent, {
            namespace: 'frameWindow',
            type: 'removeChild',
            args: {
                symbol: frameWindow.symbol
            }
        })
    }

    addListener(window, 'message', function (event) {
        const {namespace, type, args} = parseObj(event.data);

        mapping[namespace][type].call(frameWindow, args, event);
    });
}

