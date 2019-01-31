const {setWindowId} = require('../utils/frameOperate');

module.exports = function ({setFrameTree, removeChild, setAgentId, initSourceMapping}) {
    return {
        agent: {
            setId: setAgentId
        },
        frameWindow: {
            setChildren: setFrameTree,
            setWindowId,
            removeChild
        },
        browserWindow: {
            initSource: initSourceMapping
        }
    }
}