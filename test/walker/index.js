const assert = require('assert');
const console = require('console');
const acorn = require('acorn');
const types = require('../types');
const walkerTests = require('../walker-tests');
const {walker} = require('../..');

const coverage = new Map(
	types
	.map((type) => {
		return [type, 0];
	})
);

for (const [code, expectedNodes, options] of walkerTests) {
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
}

for (const [type, count] of coverage) {
	assert(0 < count, `${type} is not covered`);
}

assert.throws(() => {
	const nodes = [];
	for (const node of walker({type: 'Foo'})) {
		nodes.push(node);
	}
});

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

console.log('passed: walker');
