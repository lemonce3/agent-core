const {TAGLIST, frameListLength} = require('../constants');
const {fillArray} = require('../utils/util');
const _ = require('underscore');

const tagList = TAGLIST.join(',');

module.exports = function (isSelected, eventType, args) {
    const frameLength = frameListLength();

    if (!isSelected) {

        _.each(fillArray(new Array(frameLength), 0), function (item, index) {
            post(document.querySelectorAll(tagList)[index], {
                namespace: 'browserWindow',
                type: eventType,
                args
            });
        });
    } else {
        post(top, {
            namespace: 'browserWindow',
            type: eventType,
            args
        })
    }
}