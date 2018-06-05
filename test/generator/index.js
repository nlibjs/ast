const acorn = require('acorn');
const t = require('tap');
const {generatorTests} = require('../generator-tests');
const {types, generator, walker} = require('../..');

t.test('generator', (t) => {
	const coverage = new Map(types.map((type) => [type, 0]));
	t.test('valid', (t) => {
		for (const [code, acornOptions = {}] of generatorTests.simple) {
			t.test(JSON.stringify(code), (t) => {
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
				t.equal(actual, code);
				t.end();
			});
		}
		for (const [code, options, expected, acornOptions = {}] of generatorTests.others) {
			t.test(JSON.stringify(code), (t) => {
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
				t.equal(actual, expected);
				t.end();
			});
		}
		t.end();
	});
	t.test('invalid', (t) => {
		for (const [node, options = {}] of generatorTests.invalid) {
			t.test(JSON.stringify(node), (t) => {
				const fragments = [];
				t.throws(() => {
					for (const fragment of generator(node, options)) {
						fragments.push(fragment);
					}
				});
				t.end();
			});
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
