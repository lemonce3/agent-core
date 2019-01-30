const {TAGLIST, frameListLength} = require('../constants');
const {fillArray} = require('../utils/util');
const _ = require('underscore');

const tagList = TAGLIST.join(',');

module.exports = function (dom, eventType, args) {
    return new promise((resolve, reject) => {
        const frameLength = frameListLength();

        _.each(fillArray(new Array(frameLength), 0), function (item, index) {
            post(document.querySelectorAll(tagList)[index], {
                namespace: 'browserWindow',
                type: eventType,
                args
            });
        });
    
        addEventListener(top, 'message', function listener(event) {
            const { namespace, type, args } = parseObj(event.data);
    
            if (namespace !== 'browserWindow' || type !== eventType || args.frameId !== dom.frameId) {
                return false;
            }
    
            removeListener(top, 'message', listener);
    
            resolve(args.result);
        });
    });
}
