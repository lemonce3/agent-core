const _ = require('underscore');

const library = require('../library');
const {generateSymbol} = require('../utils/util');

const programController = {
    programId: '',
    browserWindow: null,
    resultPool: {}
}

module.exports = function changeProgram({id, name, args}, browserWindow) {
    if (programController.programId === id) {
        return false;
    }

    programController.programId = id;
    programController.browserWindow = browserWindow;

    console.log(programController.browserWindow.test)

    executeProgram({name, args});
}

function executeProgram({name, args}) {
    const url = `/window/${programController.browserWindow.browserWindowId}/program/${programController.programId}/exit`;
    const callArr = name.split('.');

    new library.promise(function (resolve, reject) {
        try {
            const executeObj = getExecutionObj(callArr);

            resolve(executeObj.call(programController.browserWindow, args[0]));
        } catch (e) {
            reject(new Error(e.message));
        }
    }).then(function (result) {
        console.log(result);

        library.ajax({
            method: 'post',
            url,
            send: JSON.stringify({
                returnValue: setResultMapping(callArr, result)
            })
        });
    }).catch(function (e) {
        library.ajax({
            method: 'post',
            url,
            send: JSON.stringify({
                error: {
                    message: e.message
                }
            })
        });
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
    let value = result;

    const isObject = typeof result === 'object';
    const isFunction = typeof result === 'function';

    //可能是一个promise对象
    if (isObject) {
        try {
            value = JSON.stringify(result);
        } catch (e) {
            value = generateResultTree(callArr, result);
        }
    }

    if (isFunction) {
        value = generateResultTree(callArr, result)
    }

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