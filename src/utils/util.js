const {TAGLIST} = require('../constants');
const _ = require('underscore');

function fillArray (arr, content) {
    const length = arr.length;

    for (let i = 0; i < length; i++) {
        arr[i] = content;
    }

    return arr;
}

function generateSymbol() {
    return Math.random().toString(36).substr(2);
}

function getDomRect(dom) {
    const { offsetWidth, offsetHeight, clientWidth,
        clientHeight, offsetTop, offsetLeft, clientTop,
        clientLeft, scrollWidth, scrollHeight } = dom;

    return {
        offsetWidth, offsetHeight, clientWidth,
        clientHeight, offsetTop, offsetLeft, clientTop,
        clientLeft, scrollWidth, scrollHeight
    }
}

function getSubSelector(selector) {
    const selectObj = {
        selector: null,
        index: -1
    };

    let isTransmit = false;

    _.each(TAGLIST, function (item) {
        if ( _.indexOf(selector, item) === -1 || selectObj.selector) {
            return false;
        }

        selectObj.selector = item;
        selectObj.index = _.indexOf(selector, item);

        isTransmit = true;
    });

    return {computed: selector.slice(selectObj.index + 1), isTransmit, contentWindow: selector.slice(0, selectObj.index + 1)};
}

module.exports = {
    fillArray, generateSymbol, getDomRect, getSubSelector
}