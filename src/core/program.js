const programRegistry = {};

const state = {
	running: null
};

const program = {};

exports.commitProgram = function commit(programOptions) {

};

exports.execute = function execute(programName, args) {
	const program = programRegistry[programName];

	if (!program) {
		throw new Error('Program is not registered.');
	}

	return program(...args);
};

exports.register = function register(name, fn) {
	if (program[name]) {
		throw new Error(`Program named ${name} has been registed.`);
	}

	program[name] = fn;
};