const {
	Promise,
	XMLHttpRequest
} = require('./polyfill');

exports.RequestAgent = class RequestAgent {
	constructor(baseURL = document.baseURI) {
		this.baseURL = baseURL;
	}

	request({
		method = 'get',
		url = '',
		data = null,
		async = true
	}) {
		const request = new XMLHttpRequest();
		const stringData = JSON.stringify(data);

		request.open(method, `${this.baseURL}${url}`, async);
		request.setRequestHeader('Content-type', 'application/json');

		return async ? new Promise((resolve, reject) => {
			request.onreadystatechange = function () {
				if (request.readyState !== 4) {
					return;
				}

				if (request.status === 200) {
					resolve(JSON.parse(request.responseText));
				} else {
					reject(request.status);
				}
			}

			request.send(stringData);
		}) : JSON.parse(request.send(stringData));
	}
}