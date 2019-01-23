const _ = require('underscore');

const agent = require('./agent');
const {generateSymbol} = require('../utils/util');

const programController = {
    programId: null,
    browserWindow: null,
    resultPool: {}
}

module.exports = function changeProgram({id, name, args}, browserWindow) {
    if (programController.programId === id) {
        return false;
    }

    programController.programId = id;
    programController.browserWindow = browserWindow;

    executeProgram({name, args});
}

// 存，取，调用（hash），结果对象池（browserWindow和agent过期或不存在了，返回结果没了，不用管）;
function executeProgram({name, args}) {
    const url = `/window/${programController.browserWindow.browserWindowId}/program/${programController.programId}}`;
    const callArr = name.split('.');
    
    let result;
    
    try {
        const executeObj = getExecutionObj(callArr);

        result = executeObj.call(programController[args.target], args.value); //可能会变化的

    } catch (e) {
        agent.ajax({
            method: 'post',
            url,
            send: JSON.stringify({
                error: e.message
            })
        });

        return false;
    }

    result = setResultMapping(callArr, result);

    console.log(programController.resultPool);

    agent.ajax({
        method: 'post',
        url,
        send: JSON.stringify({
            returnValue: result
        })
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


    throw new Error('The function is not exist.')
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
    const resultType = typeof result;
    let value = result;
    let mappingObj = programController.resultPool;

    //结果为树状的；
    if (resultType === 'object' || resultType === 'function') {
        const resultSymbol = generateSymbol();

        value = resultSymbol;

        console.log(mappingObj);

        _.each(callArr, function (item) {
            if (mappingObj[item]) {
                mappingObj = mappingObj[item];
            } else {
                mappingObj = mappingObj[item] = {};
            }
        });

        mappingObj[resultSymbol] = result;
    }

    return {
        isObject: resultType === 'object',
        isFunction: resultType === 'function',
        value
    }
}