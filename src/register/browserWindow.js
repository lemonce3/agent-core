const {setWindowId} = require('../utils/frameOperate');

module.exports = function ({setFrameTree, removeChild, setId}) {
    return {
        agent: {
            setId
        },
        frameWindow: {
            setChildren: setFrameTree,
            setWindowId,
            removeChild
        }
    }
}