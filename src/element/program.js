// 动作执行
const agent = require('./agent');

const programController = {
    running: null,
    executionStack: [],
    browserWindow: null
}

module.exports = function ({id, name, args}, browserWindow) {
    if (programController.running === id) {
        return;
    }

    const stashLength = programController.executionStack.length;

    programController.executionStack.push({id, name, args});

    if (stashLength === 0) {
        changeProgramState();
    }

    programController.browserWindow = browserWindow;
}

function changeProgramState() {
    const {id, args} = programController.executionStack[0];

    programController.running = id;

    // 执行完毕返回结果，然后remove
}

function executeProgram(args) {
    // 异步怎么办啊！！！！返回结果
}