const walker = require('./walker');
exports.walker = function* (node, options = {}) {
	yield* walker(node, [], options);
};

const generator = require('./generator');
const defaultGeneratorOptions = require('./default-generator-options');
exports.generator = function* (node, options = {}) {
	for (const key of Object.keys(defaultGeneratorOptions)) {
		options[key] = Object.assign({}, defaultGeneratorOptions[key], options[key]);
	}
	yield* generator(node, [], options);
};

exports.Generator = require('./-generator');
