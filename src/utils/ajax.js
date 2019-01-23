let baseSet = '';

function ajax({method, url, success, error, context, send}, base = baseSet) {
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

    requestObj.setRequestHeader("Content-type", "application/json");

    send ? requestObj.send(send) : requestObj.send();
}

function create({baseURL}) {
    baseSet = baseURL;

    return ajax;
}

// 测试program
// if (top === self) {
//     setTimeout(function () {

//         ajax({
//             method: 'post',
//             url: `/api/master`,
//             success: function(res) {
//                 ajax({
//                     method: 'post',
//                     url: `/api/master/${JSON.parse(res).id}/agent`,
//                     success: function () {
//                         console.log(JSON.parse(res).id);
    
//                         setInterval(function () {
//                             ajax({
//                                 method: 'get',
//                                 url: `/api/master/${JSON.parse(res).id}`
//                             }, '')
//                         }, 1000);
//                     }
//                 }, '')
    
//             }
//         }, '')
//     }, 2000);

// }

module.exports = create;