module.exports = function (windowObj, {namespace, type, argv}) {
    windowObj.postMessage(window.JSON.stringify({
        namespace, type, argv
    }), '*');
}