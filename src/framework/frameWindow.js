const post = require('../utils/postMessage');

module.exports = function (eventType, {result, error, isError}) {
    post(top, {
        namespace: 'browserWindow',
        type: eventType,
        args: {
            result, error, isError
        }
    })
}