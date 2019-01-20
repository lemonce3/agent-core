let base = '';

function ajax({method, url, success, error, context}) {
    let requestObj;

    if (window.XMLHttpRequest) {
        requestObj = new XMLHttpRequest();
    } else {
        requestObj = new ActiveXObject('Microsoft.XMLHTTP');
    }

    requestObj.onreadystatechange = function () {
        if (requestObj.readyState === 4) {
            if (requestObj.status === 200) {
                return success ? success.call(context, requestObj.responseText) : false;
            } else {
                return error ? error.call(context, requestObj.status) : false;
            }
        } else {
            //continue
        }
    }
    
    requestObj.open(method, `${base}${url}`);

    requestObj.send();
}

function create({baseURL}) {
    base = baseURL;

    return ajax;
}

module.exports = create;