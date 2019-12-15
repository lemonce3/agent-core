module.exports = function post(windowObj, {namespace, type, args}) {
    windowObj.postMessage(window.JSON.stringify({
        namespace, type, args
    }), '*');
}