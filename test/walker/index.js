const acorn = require('acorn');
const t = require('tap');
const {types} = require('../types');
const {walkerTests} = require('../walker-tests');
const {walker} = require('../..');

t.test('walker', (t) => {
	const coverage = new Map(types.map((type) => [type, 0]));
	t.test('valid', (t) => {
		for (const [code, expectedNodes, options] of walkerTests.valid) {
			t.test(JSON.stringify(code), (t) => {
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
							t.deepEqual(node[key], expected[key]);
						}
					} else {
						t.equal(node, expected);
					}
				}
				t.end();
			});
		}
		t.end();
	});
	t.test('invalid', (t) => {
		for (const ast of walkerTests.invalid) {
			t.test(JSON.stringify(ast), (t) => {
				t.throws(() => {
					const nodes = [];
					for (const node of walker(ast)) {
						nodes.push(node);
					}
				});
				t.end();
			});
		}
		t.end();
	});
	t.test('filter', (t) => {
		for (const node of walker(
			{type: 'Literal'},
			{
				Literal(node) {
					node.foo = 'foo';
					return node;
				},
			}
		)) {
			t.equal(node.foo, 'foo');
		}
		t.end();
	});
	t.test('coverage', (t) => {
		for (const [type, count] of coverage) {
			t.test(`${type}: ${count}`, (t) => {
				t.ok(0 < count, `${type} is not covered`);
				t.end();
			});
		}
		t.end();
	});
	t.end();
});
