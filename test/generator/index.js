import assert from 'assert';
import test from '@nlib/test';
import acorn from 'acorn';
import generator from '../../src/generator/index.js';
import walker from '../../src/walker/index.js';
import types from '../types/index.js';
import generatorTests from '../generator-tests/index.js';

test('Generator', (test) => {

	const coverage = new Map(
		types
		.map((type) => {
			return [type, 0];
		})
	);

	generatorTests.simple
	.forEach(([code, acornOptions = {}]) => {
		test(JSON.stringify([code, acornOptions]), () => {
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
	});

	test('coverage', (test) => {
		for (const [type, count] of coverage) {
			test(`${type}: ${count}`, () => {
				assert(0 < count);
			});
		}
	});

});
