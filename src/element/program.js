const _ = require('underscore');

const agent = require('./agent');
const {getPromise} = require('../utils/polyfill');
const {isExist} = require('../utils/util');

function init() {
    return {
        programId: '',
        browserWindow: null,
    }
}

const programController = init();

module.exports = function changeProgram({id, caller, name, args}, browserWindow) {
    if (programController.programId === id) {
        return false;
    }

    programController.programId = id;
    programController.browserWindow = browserWindow;

    executeProgram({caller, name, args});
}

function executeProgram({caller, name, args}) {
    const url = `/window/${programController.browserWindow.browserWindowId}/program/${programController.programId}/exit`;
    const callArr = name.split('.');
    const promise = getPromise();

    new promise(function (resolve, reject) {
        if (caller && caller.isFrame) {
            resolve(programController.browserWindow.executeFrameMethod(caller.hash, callArr, args));
        } else {
            const executeObj = getExecutionObj(callArr);
    
            resolve(executeObj(args[0])); //参数不确定
        }

    }).then(function (result) {
        agent.request.post(url, JSON.stringify({
            returnValue: setResultMapping(result)
        })).then(function () {
            init();
        }).catch(function () {
            init();
        });
    }).catch(function (e) {
        agent.request.post(url, JSON.stringify({
            error: {
                message: e.message
            }
        }));
    });
}

function getExecutionObj(callArr) {
    const browserResult = isExist(callArr, programController.browserWindow);

    if (browserResult.isExist) {
        return browserResult.executeObj;
    }

    throw new Error('The function is not exist.');
}

function setResultMapping(result) {
    let value = JSON.stringify(result);

    const isObject = typeof result === 'object';
    const isFunction = typeof result === 'function';

    return {
        isObject,
        isFunction,
        value
    }
}