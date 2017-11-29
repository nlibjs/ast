import assert from 'assert';
import acorn from 'acorn';
import test from '@nlib/test';
import walk from '../../src/walk/index.js';
import types from '../types/index.js';
import walkerTests from '../walker-tests/index.js';

test('walk', (test) => {

	const coverage = new Map(
		types
		.map((type) => {
			return [type, 0];
		})
	);

	for (const [code, expectedNodes, options] of walkerTests) {
		test(code, (test) => {
			const ast = acorn.parse(
				code,
				Object.assign(
					{
						ecmaVersion: 8,
						sourceType: 'module',
					},
					options
				)
			);
			let count = 0;
			walk(ast, (node) => {
				const expected = expectedNodes[count++];
				if (node) {
					const {type} = node;
					coverage.set(type, coverage.get(type) + 1);
					test(`${count} ${type}`, (test) => {
						for (const key of Object.keys(expected)) {
							test(`${key}: ${node[key]}`, () => {
								assert.deepEqual(node[key], expected[key]);
							});
						}
					});
				} else {
					test(`${node}`, () => {
						assert.equal(node, expected);
					});
				}
			});
		});
	}

	test('coverage', (test) => {
		for (const [type, count] of coverage) {
			test(`${type}: ${count}`, () => {
				assert(0 < count);
			});
		}
	});

});
