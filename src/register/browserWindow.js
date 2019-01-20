const {setWindowId} = require('../utils/frameOperate');

module.exports = function ({setFrameTree, removeChild, setAgentId}) {
    return {
        agent: {
            setId: setAgentId
        },
        frameWindow: {
            setChildren: setFrameTree,
            setWindowId,
            removeChild
        }
    }
}