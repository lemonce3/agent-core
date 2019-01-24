const _ = require('underscore');

function addListener(obj, event, callback) {
    if (obj.addEventListener) {
        obj.addEventListener(event, callback, false);
    } else {
        obj.attachEvent('on' + event, callback);
    }
}

function removeListener(obj, event, callback) {
    if (obj.removeEventListener) {
        obj.removeEventListener(event, callback, false);
    } else {
        obj.detachEvent('on' + event, callback);
    }
}

function dispatch(eventName, eventInfo){
    const eventObj = document.createEvent('CustomEvent');
    eventObj.initCustomEvent( eventName, false, false, eventInfo);
    
    if(window.dispatchEvent) {  
        window.dispatchEvent(eventObj);
    } else {
        window.fireEvent(eventObj);
    }
}

function parseObj(data) {
    if (JSON) {
        try {
            JSON.parse(data);
        } catch (e) {
            return data;
        }

        return JSON.parse(data);
    } else {
        return {};
    }
}

function getPromise() {
    if (window.Promise) {
        return Promise
    }

    return require("bluebird");
}

module.exports = {
    addListener, removeListener, parseObj, dispatch, getPromise
};