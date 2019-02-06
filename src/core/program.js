const { Promise } = require('../utils/polyfill');

const programRegistry = {};
const state = {
	running: null
};

exports.execute = function commit(programOptions) {
	const { name, args = [] } = state.running = programOptions;
	const program = programRegistry[name];

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
	}).finally(() => {
		state.running = null;
	});
};

exports.isBusy = function isBusy() {
	return Boolean(state.running);
};

exports.register = function register(name, fn) {
	if (programRegistry[name]) {
		throw new Error(`Program named ${name} has been registed.`);
	}

	programRegistry[name] = fn;
};