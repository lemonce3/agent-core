const post = require('../utils/postMessage');
const {getPromise} = require('../utils/polyfill');

const promise = getPromise();

const {addListener, parseObj, removeListener} = require('../utils/polyfill');

module.exports = function (source, eventType, args) {

    post(source, {
        namespace: 'browserWindow',
        type: eventType,
        args
    });

    return new promise((resolve, reject) => {
        addListener(top, 'message', function listener(event) {
            const { namespace, type, args } = parseObj(event.data);
            const {result, error, isError} = args;
    
            if (namespace !== 'browserWindow' || type !== eventType) {
                return false;
            }
    
            removeListener(top, 'message', listener);

            isError ? reject (new Error(error)) : resolve(result ? result : true);
        });
    });
}
