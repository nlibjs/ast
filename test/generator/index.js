const assert = require('assert');
const acorn = require('acorn');
const test = require('@nlib/test');
const types = require('../types');
const generatorTests = require('../generator-tests');
const {generator, walker} = require('../..');

test('generator', (test) => {

	const coverage = new Map(
		types
		.map((type) => {
			return [type, 0];
		})
	);

	test('valid', (test) => {
		for (const [code, acornOptions = {}] of generatorTests.simple) {
			test(JSON.stringify(code), () => {
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
		}

		for (const [code, options, expected, acornOptions = {}] of generatorTests.others) {
			test(JSON.stringify(code), () => {
				const ast = acorn.parse(code, Object.assign(
					{ecmaVersion: 8, sourceType: 'module'},
					acornOptions
				));
				for (const {type} of walker(ast)) {
					coverage.set(type, coverage.get(type) + 1);
				}
				const fragments = [];
				for (const fragment of generator(ast, options)) {
					fragments.push(fragment);
				}
				const actual = fragments.join('');
				assert.equal(actual, expected);
			});
		}
	});

	test('invalid', (test) => {
		for (const [node, options = {}] of generatorTests.invalid) {
			test(JSON.stringify(node), () => {
				const fragments = [];
				assert.throws(() => {
					for (const fragment of generator(node, options)) {
						fragments.push(fragment);
					}
				});
			});
		}
	});

	test('coverage', (test) => {
		for (const [type, count] of coverage) {
			test(`${type}: ${count}`, () => {
				assert(0 < count, `${type} is not covered`);
			});
		}
	});

});
