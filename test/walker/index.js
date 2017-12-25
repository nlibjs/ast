const assert = require('assert');
const acorn = require('acorn');
const test = require('@nlib/test');
const types = require('../types');
const walkerTests = require('../walker-tests');
const {walker} = require('../..');

test('walker', (test) => {

	const coverage = new Map(
		types
		.map((type) => {
			return [type, 0];
		})
	);

	test('valid', (test) => {
		for (const [code, expectedNodes, options] of walkerTests.valid) {
			test(JSON.stringify(code), () => {
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
				for (const node of walker(ast)) {
					const expected = expectedNodes[count++];
					if (node) {
						const {type} = node;
						coverage.set(type, coverage.get(type) + 1);
						for (const key of Object.keys(expected)) {
							assert.deepEqual(node[key], expected[key]);
						}
					} else {
						assert.equal(node, expected);
					}
				}
			});
		}
	});

	test('invalid', (test) => {
		for (const ast of walkerTests.invalid) {
			test(JSON.stringify(ast), () => {
				assert.throws(() => {
					const nodes = [];
					for (const node of walker(ast)) {
						nodes.push(node);
					}
				});
			});
		}
	});

	test('filter', () => {
		for (const node of walker(
			{type: 'Literal'},
			{
				Literal(node) {
					node.foo = 'foo';
					return node;
				},
			}
		)) {
			assert.equal(node.foo, 'foo');
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
