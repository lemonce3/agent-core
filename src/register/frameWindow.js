const {setWindowId} = require('../utils/frameOperate');

module.exports = function ({setChildren, removeChild}) {
    return {
        frameWindow: {
            setChildren, setWindowId, removeChild
        }
    }
}