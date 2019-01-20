const {TAGLIST, frameListLength} = require('../constants');
const fillArray = require('./fillArray');
const _ = require('underscore');

const tagList = TAGLIST.join(',');

function setWindowId({windowId}, {source}) {
    const frameLength = frameListLength();

    _.each(fillArray(new Array(frameLength), 0), function (item, index) {
        if ( document.querySelectorAll(tagList)[index].contentWindow === source) {
            document.querySelectorAll(tagList)[index].setAttribute('window-id', windowId);
        }
    });
}

function updateChildren(children, callback, obj) {
    return setInterval(function () {
        const frameLength = frameListLength();
        const frameList = [];

        const keys = children ? _.keys(children) : [];

        _.each(fillArray(new Array(frameLength), 0), function (item, index) {
            frameList.push(document.querySelectorAll(tagList)[index].getAttribute('window-id'));
        });

        _.each(keys, function (item) {
            if (_.indexOf(frameList, item) === -1) {
                callback.call(obj, {
                    symbol: item
                });
            }
        });

    }, 6000);
}

module.exports =  {
    setWindowId, updateChildren
};