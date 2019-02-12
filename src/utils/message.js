/**
 * PMC Post Message Conmunication
 */

const EventEmitter = require('eventemitter3');
const { addEventListener, Promise } = require('./polyfill');
const server = new EventEmitter();

server.channel = {};

exports.on = function addChannel(name, handler) {
	server.channel[name] = handler;
};

exports.off = function removeChannel(name) {
	delete server.channel[name];
};

// 监听器注册流程/模式改动（编程负担太重）

function postMessage(window, datagram) {
	const watcherId = setTimeout(function () {
		window.postMessage(JSON.stringify(datagram), '*');
		clearTimeout(watcherId);
	}, 0);
}

function PMCFilter(event) {
	const { data: datagramString } = event;

	/**
	 * It must NOT be a PMC request if data is not a string.
	 */
	if (typeof datagramString !== 'string') {
		return false;
	}

	try {
		/**
		 * It must NOT be a PMC request if data.protocol is NOT pmc.
		 */

		const datagram = JSON.parse(datagramString);

		if (datagram.protocol !== 'pmc') {
			return false;
		}

		return datagram;
	} catch (error) {
		/**
		 * It must NOT be a PMC request if data string can not be JSON.parse.
		 */
		return false;
	}
}

addEventListener(window, 'message', function (event) {
	const datagram = PMCFilter(event);

	if (!datagram) {
		return;
	}
	
	const { channel, data, id } = datagram;

	/**
	 * It is not a request
	 */
	if (!channel) {
		server.channel[`PMCResponse.listen${id}`](event);
		return;
	}

	const { source } = event;
	const handler = server.channel[channel];
	const responseDatagram = { id, protocol: 'pmc', status: 0 };

	if (!handler) {
		responseDatagram.status = 1;
		responseDatagram.data = 'Unregistered handler';

		postMessage(source, responseDatagram);
	} else {
		new Promise((resolve, reject) => {
			try {
				resolve(handler(data, source));
			} catch (error) {
				reject(error);
			}
		}).then(function (data) {
			responseDatagram.data = data;
		}, function (error) {
			responseDatagram.data = error.message;
			responseDatagram.status = 128;
		}).then(() => {
			/**
			 * The source may be gone.
			 */
			if (source) {
				postMessage(source, responseDatagram);
			}
		});
	}
});

const DEFAULT_REQUEST_TIMEOUT = 30000;
let requestId = 0;

exports.request = function requestPMCServer(origin, channel, data, {
	timeout = DEFAULT_REQUEST_TIMEOUT
} = {}) {
	//TODO 共用一个监听器可能会更安全一些
	const id = requestId++;
	const datagram = {
		channel, data, id,
		protocol: 'pmc',
	};

	try {
		postMessage(origin, datagram);

		return new Promise((resolve, reject) => {
			const watcher = setTimeout(function () {
				reject(new Error('PMC connection reset.'));
			}, timeout);

			server.channel[`PMCResponse.listen${id}`] = listenPMCResponse;

			function listenPMCResponse(event) {
				const datagram = PMCFilter(event);
				
				if (!datagram || datagram.status === undefined || datagram.id !== id) {
					return;
				}
				
				if (datagram.status !== 0) {
					return reject(new Error(datagram.data));
				}
				
				resolve(datagram);
				clearTimeout(watcher);
			}
		});
	} catch (error) {
		throw new Error('Request data can NOT be JSON.stringify.');
	}
};