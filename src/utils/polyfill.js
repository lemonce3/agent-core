function addEventListener(obj, event, callback) {
    if (obj.addEventListener) {
        obj.addEventListener(event, callback, false);
    } else {
        obj.attachEvent('on' + event, callback);
    }
}

function removeEventListener(obj, event, callback) {
    if (obj.removeEventListener) {
        obj.removeEventListener(event, callback, false);
    } else {
        obj.detachEvent('on' + event, callback);
    }
}

module.exports = {
    addEventListener, removeEventListener
};
