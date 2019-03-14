const agentWindow = require('./window');
const { Promise } = require('./utils');

function watchProgram() {
	agentWindow.nextTick(function (windowData) {
		if (!windowData.program) {
			return watchProgram();
		}

		console.log(windowData.program);

		const { name, args } = windowData.program;
		const program = agentWindow.programRegistry[name];

		return new Promise((resolve, reject) => {
			if (!program) {
				return reject(new Error('Program is not registered.'));
			}

			setTimeout(() => reject(new Error('Program execution over time.')), 10000);
	
			try {
				resolve(program.apply(null, args));
			} catch (error) {
				reject(error);
			}
		}).then(returnValue => {
			return { error: null, returnValue };
		}, error => {
			return { error };
		}).then(({ error, returnValue }) => {
			agentWindow.nextTick(windowData => {
				const { program } = windowData;

				program.error = error;
				program.returnValue = returnValue;
				program.isExited = true;

				watchProgram();
			});
		});
	});
}

function updateMeta() {
	agentWindow.nextTick(function (windowData) {
		windowData.meta = {
			title: document.title,
			URL: window.location.href,
			referrer: document.referrer,
			domain: document.domain
		};

		updateMeta();
	});
}

function updateRect() {
	agentWindow.nextTick(function (windowData) {
		windowData.rect = {
			width: document.documentElement.clientWidth,
			height: document.documentElement.clientHeight,
			top: 0,
			left: 0
		}

		updateRect();
	});
}

if (window.top === window.self) {
	watchProgram();
	updateMeta();
	updateRect();
}