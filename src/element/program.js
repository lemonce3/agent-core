const _ = require('underscore');

const agent = require('../agent');
const {getPromise} = require('../utils/polyfill');
const {generateSymbol} = require('../utils/util');

function init() {
    return {
        programId: '',
        browserWindow: null,
        // resultPool: {}
    }
}

const programController = init();

module.exports = function changeProgram({id, name, args}, browserWindow) {
    if (programController.programId === id) {
        return false;
    }

    programController.programId = id;
    programController.browserWindow = browserWindow;

    executeProgram({name, args});
}

function executeProgram({name, args}) {
    const url = `/window/${programController.browserWindow.browserWindowId}/program/${programController.programId}/exit`;
    const callArr = name.split('.');
    const promise = getPromise();

    new promise(function (resolve, reject) {
        const executeObj = getExecutionObj(callArr);

        resolve(executeObj(args[0]));
    }).then(function (result) {
        agent.request.post(url, JSON.stringify({
            returnValue: setResultMapping(callArr, result)
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
    const programResult = isExist(callArr, programController.resultPool);

    if (browserResult.isExist) {
        return browserResult.executeObj;
    }

    if (programResult.isExist) {
        return programResult.executeObj;
    }

    throw new Error('The function is not exist.');
}

function isExist(callArr, executeObj) {
    let isExist = true;

    _.each(callArr, function (item) {
        if (!executeObj[item]) {
            isExist = false;

            return;
        }

        executeObj = executeObj[item];
    });

    return {
        isExist, executeObj
    }
}

function setResultMapping(callArr, result) {
    let value = JSON.stringify(result);

    const isObject = typeof result === 'object';
    const isFunction = typeof result === 'function';

    //全部string化？
    // if (isObject) {
    //     try {
    //         value = JSON.stringify(result);
    //     } catch (e) {
    //         value = generateResultTree(callArr, result);
    //     }
    // }

    // if (isFunction) {
    //     value = generateResultTree(callArr, result)
    // }

    return {
        isObject,
        isFunction,
        value
    }
}

function generateResultTree(callArr, result) {
    const resultSymbol = generateSymbol();
    let mappingObj = programController.resultPool;

    _.each(callArr, function (item) {
        if (mappingObj[item]) {
            mappingObj = mappingObj[item];
        } else {
            mappingObj = mappingObj[item] = {};
        }
    });

    mappingObj[resultSymbol] = result;

    return resultSymbol;
}