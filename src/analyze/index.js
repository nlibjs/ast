const {walker} = require('../walker/index.js');

const getParentScope = (node) => (node.ancestors.find((parent) => parent.scope) || node).scope;

const setDeclarationsToParams = (params) => {
	for (const param of params) {
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
		identifier.declaration = params;
	}
};

const findDeclaration = (identifier) => {
	const {ancestors} = identifier;
	while (0 < ancestors.length) {
		const parentScope = getParentScope(ancestors.shift());
		const declared = parentScope.get(identifier.name);
		if (declared) {
			return declared.declaration;
		}
	}
	return undefined;
};

const analyze = (ast) => {
	let uid = 0;
	const undefinedIds = new Set();
	for (const node of walker(ast)) {
		node.uid = ++uid;
		switch (node.type) {
		case 'Program':
		case 'BlockStatement':
		case 'ClassBody':
		case 'CatchClause':
		case 'ObjectExpression':
		case 'ForStatement':
		case 'ForInStatement':
		case 'ForOfStatement':
			node.scope = new Map();
			break;
		case 'VariableDeclarator':
			node.id.declaration = node;
			break;
		case 'FunctionDeclaration':
		case 'FunctionExpression':
			node.scope = new Map();
			node.id.declaration = node;
			setDeclarationsToParams(node.params);
			break;
		case 'ArrowFunctionExpression':
			node.scope = new Map();
			setDeclarationsToParams(node.params);
			break;
		case 'Identifier':
			if (node.declaration) {
				getParentScope(node).set(node.name, node);
			} else {
				node.declaration = findDeclaration(node);
			}
			if (!node.declaration) {
				undefinedIds.add(node);
			}
			break;
		default:
		}
	}
	ast.nodeCount = uid;
	ast.undefinedIds = undefinedIds;
	return ast;
};

Object.assign(exports, {
	analyze,
});
