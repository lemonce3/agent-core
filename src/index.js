const BrowserWindow = require('./element/browserWindow');
const FrameWindow = require('./element/frameWindow');

const {addEventListener, removeEventListener} = require('./utils/polyfill');
const postMessage = require('./utils/postMessage');

const {frameListLength} = require('./constants');

const _ = require('underscore');

require('../test/click')(); //测试代码，可删

if (top === self) {
    const browserWindow = new BrowserWindow();

    const mapping = require('./register/browserWindow')(browserWindow);

    // browserWindow.init(); 初始化

    addEventListener(top, 'message', function (event) {
        const { namespace, type, argv } = window.JSON.parse(event.data);

        switch (namespace) {
            case 'agent':
                mapping.agent[type].call(browserWindow, argv);

                break;
            case 'browserWindow':
                break;
            case 'frameWindow':
                mapping.frameWindow[type].call(browserWindow, argv, event);

                console.log(browserWindow.frameTree);

                break;
        }
    });

} else {
    const frameWindow = new FrameWindow();


    const mapping = require('./register/frameWindow')(frameWindow);

    postMessage(parent, {
        namespace: 'frameWindow',
        type: 'setWindowId',
        argv: {
            windowId: frameWindow.symbol
        }
    });

    addEventListener(window, 'load', function startSignIn() {
        if (frameListLength() === 0) {
            frameWindow.signIn();
        }

        removeEventListener(window, 'load', startSignIn);
    });

    window.onunload = function () {
        postMessage(parent, {
            namespace: 'frameWindow',
            type: 'removeChild',
            argv: {
                symbol: frameWindow.symbol
            }
        })
    }

    addEventListener(window, 'message', function (event) {
        const {namespace, type, argv} = window.JSON.parse(event.data);

        switch (namespace) {
            case 'browserWindow':
                break;
            case 'frameWindow':
                mapping.frameWindow[type].call(frameWindow, argv, event);

                break;
        }
    });
}

