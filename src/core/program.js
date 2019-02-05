const programRegistry = {};

const state = {
	running: null
};

exports.execute = function execute(programName, args) {
	const program = programRegistry[programName];

	if (!program) {
		throw new Error('Program is not registered.');
	}

	return program(...args);
};