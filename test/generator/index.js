const assert = require('assert');
const console = require('console');
const acorn = require('acorn');
const types = require('../types');
const generatorTests = require('../generator-tests');
const {generator, walker} = require('../..');

const coverage = new Map(
	types
	.map((type) => {
		return [type, 0];
	})
);

generatorTests.simple
.forEach(([code, acornOptions = {}]) => {
	const ast = acorn.parse(code, Object.assign(
		{ecmaVersion: 8, sourceType: 'module'},
		acornOptions
	));
	for (const {type} of walker(ast)) {
		coverage.set(type, coverage.get(type) + 1);
	}
	const fragments = [];
	for (const fragment of generator(ast)) {
		fragments.push(fragment);
	}
	const actual = fragments.join('');
	assert.equal(actual, code);
});

for (const [type, count] of coverage) {
	assert(0 < count, `${type} is not covered`);
}

console.log('passed: generator');
