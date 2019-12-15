const BrowserWindow = require('./browserWindow');

module.exports = {
    underscore: require('underscore'),
    request: null,
    promise: require('../utils/polyfill').getPromise(),
    use: function (register, config) {
        if (!register.install) {
            throw new Error('You must have install function');
        }
    
        register.install(BrowserWindow.prototype, config);
    }
};