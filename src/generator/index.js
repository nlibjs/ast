const {isWeakOperator} = require('../is-weak-operator');
const {defaultGeneratorOptions} = require('../default-generator-options');

exports.generator = generator;

function* generator(node, options = {}) {
	for (const key of Object.keys(defaultGeneratorOptions)) {
		options[key] = Object.assign({}, defaultGeneratorOptions[key], options[key]);
	}
	yield* _generator(node, options, []);
}

function* _generator(node, options, ancestors = []) {
	if (!node) {
		return;
	}
	const {type} = node;
	const typeOptions = options[type] || {};
	node.ancestors = ancestors;
	const processed = typeOptions.filter ? typeOptions.filter(node) : node;
	const nextAncestors = [processed, ...ancestors];
	let temp;
	yield getString('before');
	switch (type) {
	case 'ArrayExpression':
	case 'ArrayPattern':
		yield reserved('[');
		yield* array('elements', reserved(','));
		yield reserved(']');
		break;
	case 'ArrowFunctionExpression':
		if (node.async) {
			yield reserved('async');
		}
		yield reserved('(');
		yield* array('params', reserved(','));
		yield reserved(')');
		yield reserved('=>');
		yield* gen('body');
		break;
	case 'AssignmentExpression':
	case 'AssignmentPattern':
		yield* gen('left');
		yield reserved(node.operator || '=');
		yield* gen('right');
		break;
	case 'AwaitExpression':
		yield reserved('await');
		yield* gen('argument');
		break;
	case 'BlockStatement':
		yield reserved('{');
		yield* array('body', reserved(';'));
		yield reserved('}');
		break;
	case 'BinaryExpression':
	case 'LogicalExpression':
		if (isWeakOperator(node.left.operator, node.operator)) {
			yield reserved('(');
			yield* gen('left');
			yield reserved(')');
		} else {
			yield* gen('left');
		}
		yield reserved(node.operator);
		if (isWeakOperator(node.right.operator, node.operator)) {
			yield reserved('(');
			yield* gen('right');
			yield reserved(')');
		} else {
			yield* gen('right');
		}
		break;
	case 'BreakStatement':
		yield reserved('break');
		yield* gen('label');
		break;
	case 'CallExpression':
		yield* gen('callee');
		yield reserved('(');
		yield* array('arguments', reserved(','));
		yield reserved(')');
		break;
	case 'CatchClause':
		yield reserved('(');
		yield* gen('param');
		yield reserved(')');
		yield* gen('body');
		break;
	case 'ClassBody':
		yield reserved('{');
		yield* array('body', reserved(','));
		yield reserved('}');
		break;
	case 'ClassDeclaration':
	case 'ClassExpression':
		yield reserved('class');
		yield* gen('id');
		if (node.superClass) {
			yield reserved('extends');
			yield* gen('superClass');
		}
		yield* gen('body');
		break;
	case 'ConditionalExpression':
		yield* gen('test');
		yield reserved('?');
		yield* gen('consequent');
		yield reserved(':');
		yield* gen('alternate');
		break;
	case 'ContinueStatement':
		yield reserved('continue');
		yield* gen('label');
		break;
	case 'DebuggerStatement':
		yield reserved('debugger');
		break;
	case 'DoWhileStatement':
		yield reserved('do');
		yield* gen('body');
		yield reserved('while');
		yield reserved('(');
		yield* gen('test');
		yield reserved(')');
		break;
	case 'EmptyStatement':
		yield reserved(';');
		break;
	case 'ExportAllDeclaration':
		yield reserved('export');
		yield reserved('*');
		yield reserved('from');
		yield* gen('source');
		break;
	case 'ExportDefaultDeclaration':
		yield reserved('export');
		yield reserved('default');
		yield* gen('declaration');
		break;
	case 'ExportNamedDeclaration':
		yield reserved('export');
		if (node.declaration) {
			yield* gen('declaration');
		} else {
			yield reserved('{');
			yield* array('specifiers', reserved(','));
			yield reserved('}');
		}
		break;
	case 'ExportSpecifier':
		yield* gen('local');
		if (node.local.name !== node.exported.name) {
			yield reserved('as');
			yield* gen('exported');
		}
		break;
	case 'ExpressionStatement':
		yield* gen('expression');
		break;
	case 'ForInStatement':
		yield reserved('for');
		yield reserved('(');
		yield* gen('left');
		yield reserved('in');
		yield* gen('right');
		yield reserved(')');
		yield* gen('body');
		break;
	case 'ForOfStatement':
		yield reserved('for');
		yield reserved('(');
		yield* gen('left');
		yield reserved('of');
		yield* gen('right');
		yield reserved(')');
		yield* gen('body');
		break;
	case 'ForStatement':
		yield reserved('for');
		yield reserved('(');
		yield* gen('init');
		yield reserved(';');
		yield* gen('test');
		yield reserved(';');
		yield* gen('update');
		yield reserved(')');
		yield* gen('body');
		break;
	case 'FunctionDeclaration':
		if (node.async) {
			yield reserved('async');
		}
		yield reserved(node.generator ? 'function*' : 'function');
		yield* gen('id');
		yield reserved('(');
		yield* array('params', reserved(','));
		yield reserved(')');
		yield* gen('body');
		break;
	case 'FunctionExpression':
		[temp] = ancestors;
		if (!(
			temp.type === 'MethodDefinition' ||
			(temp.type === 'Property' && (temp.method || temp.kind !== 'init'))
		)) {
			if (node.async) {
				yield reserved('async');
			}
			yield reserved(node.generator ? 'function*' : 'function');
		}
		if (node.id) {
			yield* gen('id');
		}
		yield reserved('(');
		yield* array('params', reserved(','));
		yield reserved(')');
		yield* gen('body');
		break;
	case 'Identifier':
		yield node.name;
		break;
	case 'IfStatement':
		yield reserved('if');
		yield reserved('(');
		yield* gen('test');
		yield reserved(')');
		yield* gen('consequent');
		if (node.alternate) {
			yield reserved('else');
			yield* gen('alternate');
		}
		break;
	case 'ImportDeclaration':
		yield reserved('import');
		if (0 < node.specifiers.length) {
			const {specifiers} = node;
			const {length} = specifiers;
			let i = 0;
			let named = false;
			if (node.specifiers[0].type === 'ImportDefaultSpecifier') {
				yield* _generator(node.specifiers[0], options, nextAncestors);
				i = 1;
			}
			while (i < length) {
				const specifier = specifiers[i];
				if (0 < i++) {
					yield reserved(',');
				}
				if (specifier.type === 'ImportSpecifier') {
					if (!named) {
						yield reserved('{');
						named = true;
					}
				}
				yield* _generator(specifier, options, nextAncestors);
			}
			if (named) {
				yield reserved('}');
			}
			yield reserved('from');
		}
		yield* gen('source');
		break;
	case 'ImportDefaultSpecifier':
		yield* gen('local');
		break;
	case 'ImportNamespaceSpecifier':
		yield reserved('*');
		yield reserved('as');
		yield* gen('local');
		break;
	case 'ImportSpecifier':
		yield* gen('imported');
		if (node.imported.name !== node.local.name) {
			yield reserved('as');
			yield* gen('local');
		}
		break;
	case 'LabeledStatement':
		yield* gen('label');
		yield reserved(':');
		yield* gen('body');
		break;
	case 'Literal':
		yield node.raw;
		break;
	case 'MemberExpression':
		yield* gen('object');
		yield reserved('.');
		yield* gen('property');
		break;
	case 'MetaProperty':
		yield* 'new.target';
		break;
	case 'MethodDefinition':
		if (node.static) {
			yield reserved('static');
		}
		if (node.kind !== 'method') {
			yield reserved(node.kind);
		} else if (node.value.async) {
			yield reserved('async');
		} else if (node.value.generator) {
			yield reserved('*');
		}
		yield* gen('key');
		yield* gen('value');
		break;
	case 'NewExpression':
		yield reserved('new');
		yield* gen('callee');
		yield reserved('(');
		yield* array('arguments', reserved(','));
		yield reserved(')');
		break;
	case 'ObjectExpression':
	case 'ObjectPattern':
		yield reserved('{');
		yield* array('properties', reserved(','));
		yield reserved('}');
		break;
	case 'Program':
		yield* array('body', reserved(';'));
		break;
	case 'Property':
		if (node.kind !== 'init') {
			// set, get, etc.
			yield reserved(node.kind);
		}
		if (node.computed) {
			yield reserved('[');
			yield* gen('key');
			yield reserved(']');
			if (node.value.type !== 'FunctionExpression') {
				yield reserved(':');
			}
		} else if (!node.shorthand) {
			yield* gen('key');
			if (!node.method && node.kind === 'init') {
				yield reserved(':');
			}
		}
		yield* gen('value');
		break;
	case 'ParenthesizedExpression':
		yield reserved('(');
		yield* gen('expression');
		yield reserved(')');
		break;
	case 'RestElement':
		yield reserved('...');
		yield* gen('argument');
		break;
	case 'ReturnStatement':
		yield reserved('return');
		yield* gen('argument');
		break;
	case 'SequenceExpression':
		yield* array('expressions', reserved(','));
		break;
	case 'SpreadElement':
		yield reserved('...');
		yield* gen('argument');
		break;
	case 'Super':
		yield reserved('super');
		break;
	case 'SwitchCase':
		if (node.test) {
			yield reserved('case');
			yield* gen('test');
		} else {
			yield reserved('default');
		}
		yield reserved(':');
		if (0 < node.consequent.length) {
			yield* array('consequent', reserved(';'));
			yield reserved(';');
		}
		break;
	case 'SwitchStatement':
		yield reserved('switch');
		yield reserved('(');
		yield* gen('discriminant');
		yield reserved(')');
		yield reserved('{');
		yield* array('cases');
		yield reserved('}');
		break;
	case 'TaggedTemplateExpression':
		yield* gen('tag');
		yield* gen('quasi');
		break;
	case 'TemplateElement':
		yield node.value.raw;
		break;
	case 'TemplateLiteral':
		yield reserved('`');
		yield* _generator(node.quasis[0], options, nextAncestors);
		temp = 1;
		for (const expression of node.expressions) {
			yield reserved('${');
			yield* _generator(expression, options, nextAncestors);
			yield reserved('}');
			yield* _generator(node.quasis[temp++], options, nextAncestors);
		}
		yield reserved('`');
		break;
	case 'ThisExpression':
		yield reserved('this');
		break;
	case 'ThrowStatement':
		yield reserved('throw');
		yield* gen('argument');
		break;
	case 'TryStatement':
		yield reserved('try');
		yield* gen('block');
		yield reserved('catch');
		yield* gen('handler');
		if (node.finalizer) {
			yield reserved('finally');
			yield* gen('finalizer');
		}
		break;
	case 'UnaryExpression':
	case 'UpdateExpression':
		if (node.prefix) {
			yield reserved(node.operator);
			yield* gen('argument');
		} else {
			yield* gen('argument');
			yield reserved(node.operator);
		}
		break;
	case 'VariableDeclaration':
		yield reserved(node.kind);
		yield* array('declarations', reserved(','));
		break;
	case 'VariableDeclarator':
		yield* gen('id');
		if (node.init) {
			yield reserved('=');
			yield* gen('init');
		}
		break;
	case 'WhileStatement':
		yield reserved('while');
		yield reserved('(');
		yield* gen('test');
		yield reserved(')');
		yield* gen('body');
		break;
	case 'WithStatement':
		yield reserved('with');
		yield reserved('(');
		yield* gen('object');
		yield reserved(')');
		yield* gen('body');
		break;
	case 'YieldExpression':
		yield reserved(node.delegate ? 'yield*' : 'yield');
		yield* gen('argument');
		break;
	default:
		throw new Error(`Unknown type: ${node.type}`);
	}
	yield getString('after');

	function reserved(key) {
		return getString(key) || key;
	}

	function getString(key) {
		const option = typeOptions[key] || '';
		switch (typeof option) {
		case 'function':
			return option(...nextAncestors);
		case 'string':
			return option;
		default:
			throw new Error(`Invalid option: ${option}`);
		}
	}

	function* array(key, between = '') {
		const nodes = node[key];
		yield* _generator(nodes[0], options, nextAncestors);
		const {length} = nodes;
		for (let i = 1; i < length; i++) {
			yield between;
			yield* _generator(nodes[i], options, nextAncestors);
		}
	}

	function* gen(key) {
		yield* _generator(node[key], options, nextAncestors);
	}
}
