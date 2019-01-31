const {getPromise} = require('./polyfill');
const _ = require('underscore');

function Request(baseURL = '') {
    this.baseURL = baseURL;

    this.get = (url) => {
        return this.baseRequest({method: 'get', url});
    }

    this.post = (url, body, config) => {
        return this.baseRequest({method: 'post', url, body, config});
    }

    this.put = (url, body, config) => {
        return this.baseRequest({method: 'put', url, body, config});
    }

    this.delete = (url) => {
        return this.baseRequest({method: 'delete', url});
    }

    this.baseRequest = ({method, url, body, config}) => {
        const promise = getPromise();
        let requestObj;

        if (window.XMLHttpRequest) {
            const xhr = window.XMLHttpRequest;

            requestObj = new xhr();
        } else {
            const activeX = window.ActiveXObject;

            requestObj = new activeX('Microsoft.XMLHTTP');
        }
        
        return new promise((resolve, reject) => {
            requestObj.onreadystatechange = function () {
                if (requestObj.readyState === 4) {
                    if (requestObj.status === 200) {
                        resolve(requestObj.responseText);
                    } else {
                        reject(requestObj.status);
                    }
                }
            }

            requestObj.open(method, `${this.baseURL}${url}`);

            if (config && typeof config === 'object') {
                const keyList = _.keys(config);

                _.each(keyList, (item) => {
                    requestObj.setRequestHeader(item, config[item]);
                });
            } else {
                requestObj.setRequestHeader("Content-type", "application/json");
            }

            requestObj.send(body);
        });
    }
}

function create(baseURL) {
    return new Request(baseURL);
}

// 测试program
// if (top === self) {
//     setTimeout(function () {
//         const xhr = new Request();
//         xhr.post(`/api/master`, null).then((res) => {
//             xhr.post(`/api/master/${JSON.parse(res).id}/agent`, null).then((res1) => {
//                 setInterval(function () {
//                     xhr.get(`/api/master/${JSON.parse(res).id}`)
//                 }, 1000);
//             })
//         })
//     }, 2000);
// }

module.exports = {
    create, request: new Request()
};