const t = require('tap');
const acorn = require('acorn');
const console = require('console');
const chalk = require('chalk');
const {removeIndent} = require('@nlib/util');
const {types, analyze, walker, print} = require('../..');
const getAST = (notCovered, code, options) => {
	const ast = acorn.parse(code, Object.assign({
		sourceType: 'module',
		ecmaVersion: 2018,
		preserveParens: true,
	}, options));
	for (const node of walker(ast)) {
		notCovered.delete(node.type);
	}
	return analyze(ast);
};
const printOnFail = (t, code, ast) => {
	if (0 < t.results.fail) {
		console.log(chalk.dim('------ code ------'));
		console.log(removeIndent(code));
		console.log(chalk.dim('------ ast ------'));
		console.log(print(ast));
	}
};

t.test('analyze', (t) => {

	const notCovered = new Set(types);

	t.test('variable', (t) => {
		const code = `
		const foo = [!1 & 2 ? 3 : \`\${4 && (5 + 6)}\`, ...[]], bar = baz = 'baz';
		[foo] = [''];
		({foo}) = [], {};
		`;
		const ast = getAST(notCovered, code);
		t.equal(ast.scope.size, 3);
		t.match(ast.scope.get('foo'), {
			declaration: {
				type: 'VariableDeclarator',
				init: {type: 'ArrayExpression'},
			},
		});
		t.match(ast.scope.get('bar'), {
			declaration: {
				type: 'VariableDeclarator',
				init: {type: 'AssignmentExpression'},
			},
		});
		t.match(ast.scope.get('baz'), {
			declaration: undefined,
		});
		t.end();
		printOnFail(t, code, ast);
	});

	t.test('FunctionDeclaration', (t) => {
		const code = `
		function* foo(foo1, foo2 = foo3, ...foo4) {
			const foo5 = 'foo5';
			yield this;
		}
		foo(...[1, 2, 3]);
		`;
		const ast = getAST(notCovered, code);
		t.equal(ast.scope.size, 2);
		t.match(ast.scope.get('foo3'), {
			declaration: undefined,
		});
		const foo = ast.scope.get('foo');
		t.match(foo, {
			declaration: {
				type: 'FunctionDeclaration',
			},
		});
		const functionScope = foo.declaration.body.scope;
		t.equal(functionScope.size, 4);
		t.match(functionScope.get('foo1'), {
			declaration: {type: 'FunctionDeclaration'},
		});
		t.match(functionScope.get('foo2'), {
			declaration: {type: 'FunctionDeclaration'},
		});
		t.match(functionScope.get('foo4'), {
			declaration: {type: 'FunctionDeclaration'},
		});
		t.match(functionScope.get('foo5'), {
			declaration: {type: 'VariableDeclarator'},
		});
		t.end();
		printOnFail(t, code, ast);
	});

	t.test('FunctionExpression', (t) => {
		const code = `
		const foo = async function (foo1, foo2 = foo3, ...foo4) {
			const foo5 = await 'foo5';
		}
		foo(...[1, 2, 3]);
		`;
		const ast = getAST(notCovered, code);
		t.equal(ast.scope.size, 2);
		t.match(ast.scope.get('foo3'), {
			declaration: undefined,
		});
		const foo = ast.scope.get('foo');
		t.match(foo, {
			declaration: {
				type: 'VariableDeclarator',
				init: {type: 'FunctionExpression'},
			},
		});
		const functionScope = foo.declaration.init.body.scope;
		t.equal(functionScope.size, 4);
		t.match(functionScope.get('foo1'), {
			declaration: {type: 'FunctionExpression'},
		});
		t.match(functionScope.get('foo2'), {
			declaration: {type: 'FunctionExpression'},
		});
		t.match(functionScope.get('foo4'), {
			declaration: {type: 'FunctionExpression'},
		});
		t.match(functionScope.get('foo5'), {
			declaration: {type: 'VariableDeclarator'},
		});
		t.end();
		printOnFail(t, code, ast);
	});

	t.test('ArrowFunctionExpression', (t) => {
		const code = `
		const foo = (foo1, foo2 = foo3, ...foo4) => {
			const foo5 = 'foo5';
		}
		foo(...[1, 2, 3]);
		`;
		const ast = getAST(notCovered, code);
		t.equal(ast.scope.size, 2);
		t.match(ast.scope.get('foo3'), {
			declaration: undefined,
		});
		const foo = ast.scope.get('foo');
		t.match(foo, {
			declaration: {
				type: 'VariableDeclarator',
				init: {type: 'ArrowFunctionExpression'},
			},
		});
		const functionScope = foo.declaration.init.body.scope;
		t.equal(functionScope.size, 4);
		t.match(functionScope.get('foo1'), {
			declaration: {type: 'ArrowFunctionExpression'},
		});
		t.match(functionScope.get('foo2'), {
			declaration: {type: 'ArrowFunctionExpression'},
		});
		t.match(functionScope.get('foo4'), {
			declaration: {type: 'ArrowFunctionExpression'},
		});
		t.match(functionScope.get('foo5'), {
			declaration: {type: 'VariableDeclarator'},
		});
		t.end();
		printOnFail(t, code, ast);
	});

	t.test('ForStatement', (t) => {
		const code = `
		for (let key = 0; key < 10; key++) {
			const foo = key;
		}
		`;
		const ast = getAST(notCovered, code);
		t.equal(ast.scope.size, 0);
		const forStatementScope = ast.body[0].body.scope;
		t.equal(forStatementScope.size, 2);
		t.match(forStatementScope.get('key'), {
			declaration: {type: 'ForStatement'},
		});
		t.match(forStatementScope.get('foo'), {
			declaration: {type: 'VariableDeclarator'},
		});
		t.end();
		printOnFail(t, code, ast);
	});

	// t.test('ForXXStatement', (t) => {
	// 	const code = `
	// 	for (let key = 0; key < 10; key++) {
	// 		const foo = key;
	// 	}
	// 	const foo = [];
	// 	for (let key in foo) {
	// 		const foo = key;
	// 	}
	// 	for (let key of foo) {
	// 		const foo = key;
	// 	}
	// 	`;
	// 	const ast = getAST(notCovered, code);
	// 	t.equal(ast.body.length, 4);
	// 	t.equal(ast.scope.size, 1);
	// 	t.match(ast.scope.get('foo'), {
	// 		declaration: {type: 'VariableDeclarator'},
	// 	});
	// 	t.test('ForStatement', (t) => {
	// 		const [forStatement] = ast.body;
	// 		t.equal(forStatement.body.scope.size, 2);
	// 		t.match(forStatement.body.scope.get('key'), {
	// 			declaration: {type: 'ForStatement'},
	// 		});
	// 		// t.match(forStatement.body.scope.get('foo'), {
	// 		// 	declaration: {type: 'VariableDeclarator'},
	// 		// });
	// 		t.end();
	// 	});
	// 	// t.test('ForInStatement', (t) => {
	// 	// 	const [,, forInStatement] = ast.body;
	// 	// 	t.equal(forInStatement.body.scope.size, 2);
	// 	// 	t.match(forInStatement.body.scope.get('key'), {
	// 	// 		declaration: {type: 'ForStatement'},
	// 	// 	});
	// 	// 	t.match(forInStatement.body.scope.get('foo'), {
	// 	// 		declaration: {type: 'VariableDeclarator'},
	// 	// 	});
	// 	// 	t.end();
	// 	// });
	// 	// t.test('ForOfStatement', (t) => {
	// 	// 	const [,,, forOfStatement] = ast.body;
	// 	// 	t.equal(forOfStatement.body.scope.size, 2);
	// 	// 	t.match(forOfStatement.body.scope.get('key'), {
	// 	// 		declaration: {type: 'ForStatement'},
	// 	// 	});
	// 	// 	t.match(forOfStatement.body.scope.get('foo'), {
	// 	// 		declaration: {type: 'VariableDeclarator'},
	// 	// 	});
	// 	// 	t.end();
	// 	// });
	// 	t.end();
	// 	printOnFail(t, code, ast);
	// });

	console.log([...notCovered].join(','));

	// t.equal(notCovered.size, 0, [...notCovered].join(','));
	t.end();
	// const items = [
	// 	{
	// 		title: 'functions',
	// 		code: `
	// 		function* foo(foo1 = 1, foo2, ...foo3) {
	// 			yield foo3;
	// 			return new.target && this;
	// 		}
	// 		async function bar() {
	// 			await foo();
	// 			throw 0;
	// 		}
	// 		foo,new foo(baz);
	// 		`,
	// 		pattern: {
	// 			scope: new Set([
	// 				{name: 'foo'},
	// 				{name: 'bar'},
	// 				{name: 'baz'},
	// 			]),
	// 			body: [
	// 				{
	// 					type: 'FunctionDeclaration',
	// 					scope: new Set([
	// 						{name: 'foo1'},
	// 						{name: 'foo2'},
	// 						{name: 'foo3'},
	// 					]),
	// 				},
	// 			],
	// 		},
	// 	},
	// 	{
	// 		title: 'classes',
	// 		code: `
	// 		class Foo extends Foo1 {
	// 			constructor() {
	// 				super();
	// 			}
	// 			foo() {
	// 				super.foo();
	// 			}
	// 		};
	// 		const Bar1 = class Bar {};
	// 		`,
	// 		pattern: {
	// 			scope: new Set([
	// 				{name: 'Foo'},
	// 				{name: 'Foo1'},
	// 				{name: 'Bar1'},
	// 				{name: 'Bar'},
	// 			]),
	// 			body: [
	// 				{
	// 					body: {
	// 						scope: new Set([
	// 							{name: 'foo'},
	// 						]),
	// 					},
	// 				},
	// 			],
	// 		},
	// 	},
	// 	{
	// 		title: 'object',
	// 		code: `
	// 		const foo = {
	// 			bar,
	// 			baz,
	// 		};
	// 		`,
	// 		pattern: {
	// 			scope: new Set([
	// 				{name: 'foo'},
	// 			]),
	// 			body: [
	// 				{
	// 					declarations: [
	// 						{
	// 							init: {
	// 								scope: new Set([
	// 									{name: 'bar'},
	// 									{name: 'baz'},
	// 								]),
	// 							},
	// 						},
	// 					],
	// 				},
	// 			],
	// 		},
	// 	},
	// 	{
	// 		title: 'statement',
	// 		code: `
	// 		{
	// 			const foo = 'foo';
	// 		};
	// 		`,
	// 		pattern: {
	// 			scope: {size: 0},
	// 			body: [
	// 				{
	// 					scope: new Set([
	// 						{name: 'foo'},
	// 					]),
	// 				},
	// 			],
	// 		},
	// 	},
	// 	{
	// 		title: 'if statement',
	// 		code: `
	// 		if (true) {
	// 			const foo = 'foo';
	// 		} else {
	// 			const foo = 'foo';
	// 		}
	// 		`,
	// 		pattern: {
	// 			scope: {size: 0},
	// 			body: [
	// 				{
	// 					consequent: {
	// 						scope: new Set([
	// 							{name: 'foo'},
	// 						]),
	// 					},
	// 					alternate: {
	// 						scope: new Set([
	// 							{name: 'foo'},
	// 						]),
	// 					},
	// 				},
	// 			],
	// 		},
	// 	},
	// 	{
	// 		title: 'labeled statement',
	// 		code: `
	// 		foo: {
	// 			const foo = 'foo';
	// 		}
	// 		`,
	// 		pattern: {
	// 			scope: {size: 0},
	// 			body: [
	// 				{
	// 					body: {
	// 						scope: new Set([
	// 							{name: 'foo'},
	// 						]),
	// 					},
	// 				},
	// 			],
	// 		},
	// 	},
	// 	{
	// 		title: 'switch statement',
	// 		code: `
	// 		switch (foo) {
	// 		case bar:
	// 			break;
	// 		default:
	// 		}
	// 		`,
	// 		pattern: {
	// 			scope: new Set([
	// 				{name: 'foo'},
	// 				{name: 'bar'},
	// 			]),
	// 		},
	// 	},
	// 	{
	// 		title: 'while statement',
	// 		code: `
	// 		while (foo) {
	// 			const bar = 'bar';
	// 			debugger;
	// 		}
	// 		`,
	// 		pattern: {
	// 			scope: new Set([
	// 				{name: 'foo'},
	// 			]),
	// 			body: [
	// 				{
	// 					type: 'WhileStatement',
	// 					body: {
	// 						scope: new Set([
	// 							{name: 'bar'},
	// 						]),
	// 					},
	// 				},
	// 			],
	// 		},
	// 	},
	// 	{
	// 		title: 'do-while statement',
	// 		code: `
	// 		do {
	// 			const bar = 'bar';
	// 		} while (foo);
	// 		`,
	// 		pattern: {
	// 			scope: new Set([
	// 				{name: 'foo'},
	// 			]),
	// 			body: [
	// 				{
	// 					type: 'DoWhileStatement',
	// 					body: {
	// 						scope: new Set([
	// 							{name: 'bar'},
	// 						]),
	// 					},
	// 				},
	// 			],
	// 		},
	// 	},
	// 	{
	// 		title: 'arrow function',
	// 		code: `
	// 		const foo = bar = () => {
	// 			const baz = 'baz';
	// 		};
	// 		`,
	// 		pattern: {
	// 			scope: new Set([
	// 				{name: 'foo'},
	// 				{name: 'bar'},
	// 			]),
	// 			body: [
	// 				{
	// 					type: 'VariableDeclaration',
	// 					declarations: [
	// 						{
	// 							type: 'VariableDeclarator',
	// 							init: {
	// 								type: 'AssignmentExpression',
	// 								right: {
	// 									type: 'ArrowFunctionExpression',
	// 									body: {
	// 										scope: new Set([
	// 											{name: 'baz'},
	// 										]),
	// 									},
	// 								},
	// 							},
	// 						},
	// 					],
	// 				},
	// 			],
	// 		},
	// 	},
	// 	{
	// 		title: 'try-catch statement',
	// 		code: `
	// 		try {
	// 			const foo1 = 'foo1';
	// 		} catch (error) {
	// 			const foo2 = 'foo2';
	// 		} finally {
	// 			const foo3 = 'foo3';
	// 		}
	// 		`,
	// 		pattern: {
	// 			scope: {size: 0},
	// 			body: [
	// 				{
	// 					type: 'TryStatement',
	// 					block: {
	// 						type: 'BlockStatement',
	// 						scope: new Set([
	// 							{name: 'foo1'},
	// 						]),
	// 					},
	// 					handler: {
	// 						scope: new Set([
	// 							{name: 'error'},
	// 						]),
	// 						body: {
	// 							type: 'BlockStatement',
	// 							scope: new Set([
	// 								{name: 'foo2'},
	// 							]),
	// 						},
	// 					},
	// 					finalizer: {
	// 						type: 'BlockStatement',
	// 						scope: new Set([
	// 							{name: 'foo3'},
	// 						]),
	// 					},
	// 				},
	// 			],
	// 		},
	// 	},
	// 	{
	// 		title: 'for-of statement',
	// 		code: `
	// 		for (const foo of bar) {
	// 			const {baz} = foo;
	// 			continue;
	// 		}
	// 		`,
	// 		pattern: {
	// 			scope: new Set([
	// 				{name: 'bar'},
	// 			]),
	// 			body: [
	// 				{
	// 					type: 'ForOfStatement',
	// 					scope: new Set([
	// 						{name: 'foo'},
	// 					]),
	// 					body: {
	// 						scope: new Set([
	// 							{name: 'baz'},
	// 						]),
	// 					},
	// 				},
	// 			],
	// 		},
	// 	},
	// 	{
	// 		title: 'for-in statement',
	// 		code: `
	// 		for (const foo in bar) {
	// 			const {baz} = foo;
	// 			continue;
	// 		}
	// 		`,
	// 		pattern: {
	// 			scope: new Set([
	// 				{name: 'bar'},
	// 			]),
	// 			body: [
	// 				{
	// 					type: 'ForOfStatement',
	// 					scope: new Set([
	// 						{name: 'foo'},
	// 					]),
	// 					body: {
	// 						scope: new Set([
	// 							{name: 'baz'},
	// 						]),
	// 					},
	// 				},
	// 			],
	// 		},
	// 	},
	// 	{
	// 		title: 'for statement',
	// 		code: `
	// 		for (let foo = 0; foo < 10; foo++) {
	// 			const {baz} = foo;
	// 			continue;
	// 		}
	// 		`,
	// 		pattern: {
	// 			scope: new Set([
	// 				{name: 'bar'},
	// 			]),
	// 			body: [
	// 				{
	// 					type: 'ForOfStatement',
	// 					scope: new Set([
	// 						{name: 'foo'},
	// 					]),
	// 					body: {
	// 						scope: new Set([
	// 							{name: 'baz'},
	// 						]),
	// 					},
	// 				},
	// 			],
	// 		},
	// 	},
	// 	{
	// 		title: 'export statement',
	// 		code: `
	// 		import * as foo0 from 'foo';
	// 		import foo1 from 'foo';
	// 		import {foo2 as foo3, foo4} from 'foo';
	// 		export * from 'foo';
	// 		export {bar1 as bar2, bar3} from 'bar';
	// 		export const bar = 'bar';
	// 		export default bar;
	// 		`,
	// 		pattern: {
	// 			scope: {size: 0},
	// 		},
	// 	},
	// 	{
	// 		title: 'with statement',
	// 		code: `
	// 		with (foo) {
	// 			bar;
	// 		}
	// 		`,
	// 		pattern: {
	// 			scope: {size: 0},
	// 		},
	// 		options: {
	// 			sourceType: 'script',
	// 		},
	// 	},
	// ];
});
