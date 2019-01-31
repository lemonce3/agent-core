const {setWindowId} = require('../utils/frameOperate');

module.exports = function ({setChildren, removeChild, document, execute}) {
    const {select, element} = document;
    const {attribute, tagName, text, property, css, rect, alert, prompt, confirm} = element;
    
    return {
        frameWindow: {
            setChildren, setWindowId, removeChild
        },
        browserWindow: {
            select,
            attribute, tagName, text, property, css, rect, alert, prompt, confirm,
            executeMethod: execute
        }
    }
}