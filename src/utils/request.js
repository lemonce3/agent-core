const _ = require('underscore');
const {
	Promise,
	XMLHttpRequest
} = require('./polyfill');

function RequestAgent(baseURL = document.baseURI) {
	this.baseURL = baseURL;
}

RequestAgent.prototype.request = function ({
	method = 'get',
	url = '',
	data = null,
	async = true
}) {
	const request = new XMLHttpRequest();
	const stringData = JSON.stringify(data);

	request.open(method, `${this.baseURL}${url}?_time${_.now()}`, async);
	request.setRequestHeader('Content-type', 'application/json');

	return async ?new Promise((resolve, reject) => {
		request.onreadystatechange = function () {
			if (request.readyState !== 4) {
				return;
			}

			if (request.status === 200) {
				resolve(JSON.parse(request.responseText));
			} else {
				reject(request.status);
			}
		};

		request.send(stringData);
	}): JSON.parse(request.send(stringData));
};

exports.RequestAgent = RequestAgent;