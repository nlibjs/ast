const {walker} = require('../walker');
const PROCESSED = Symbol('PROCESSED');

const mark = (node) => {
	node[PROCESSED] = true;
	return node;
};

const addToScope = (scope, identifier) => {
	for (const node of walker(identifier)) {
		if (node.type === 'Identifier') {
			const {name} = mark(node);
			const current = scope.get(name);
			if (current) {
				if (node.declaration && current.declaration) {
					throw new Error('Two declarations are conflicted');
				}
				if (!current.declaration) {
					current.declaration = node.declaration;
					scope.set(name, node);
				}
			} else {
				scope.set(name, node);
			}
		}
	}
};

const addToParent = (node, identifier = node) => {
	if (node && identifier) {
		const parentScopeNode = node.ancestors.find((parent) => parent.scope) || node;
		if (parentScopeNode) {
			addToScope(parentScopeNode.scope, identifier);
		}
	}
};

const addParamsToFunctionScope = (functionNode) => {
	const body = mark(functionNode.body);
	const scope = body.scope = new Map();
	for (const param of functionNode.params) {
		let identifier;
		switch (param.type) {
		case 'Identifier':
			identifier = param;
			break;
		case 'AssignmentPattern':
			identifier = param.left;
			break;
		case 'RestElement':
			identifier = param.argument;
			break;
		default:
			throw new Error(`Unknown type of param ${param.type}`);
		}
		identifier.declaration = functionNode;
		addToScope(scope, identifier);
	}
};

const analyze = (ast) => {
	let uid = 0;
	for (const node of walker(ast)) {
		node.uid = ++uid;
		if (!node[PROCESSED]) {
			mark(node);
			switch (node.type) {
			case 'Program':
			case 'BlockStatement':
			case 'ClassBody':
			case 'CatchClause':
			case 'ObjectExpression':
				node.scope = new Map();
				break;
			case 'ForStatement':
			case 'ForInStatement':
			case 'ForOfStatement':
				addToParent(node, node.right);
				node.scope = new Map();
				break;
			case 'VariableDeclarator':
				node.id.declaration = node;
				break;
			case 'FunctionDeclaration':
				node.id.declaration = node;
				addToParent(node, node.id);
				addParamsToFunctionScope(node);
				break;
			case 'ArrowFunctionExpression':
			case 'FunctionExpression':
				addToParent(node, node.id);
				addParamsToFunctionScope(node);
				break;
			case 'Identifier':
				addToParent(node);
				break;
			default:
			}
		}
	}
	ast.nodeCount = uid;
	return ast;
};

Object.assign(exports, {
	analyze,
});
