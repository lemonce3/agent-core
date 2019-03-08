const agent = module.exports = {
	underscore: require('underscore'),
	utils: require('./utils'),
	window: top === self ? require('./window') : null,
	frame: require('./frame'),
	pmc: require('@lemonce3/pmc/src'),
	use(install) {
		install(agent);
	}
};

require('./watcher');
require('./programs');