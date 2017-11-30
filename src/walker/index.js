function* walker(node, ancestors, options) {
	if (!node) {
		return;
	}
	node.ancestors = ancestors;
	const {type} = node;
	const processed = options[type] ? options[type](node) : node;
	yield processed;
	const nextAncestors = [processed, ...ancestors];
	switch (type) {
	case 'ArrayExpression':
	case 'ArrayPattern':
		yield* arrayWalker(node.elements, nextAncestors, options);
		break;
	case 'ArrowFunctionExpression':
	case 'FunctionDeclaration':
	case 'FunctionExpression':
		yield* walker(node.id, nextAncestors, options);
		yield* arrayWalker(node.params, nextAncestors, options);
		yield* walker(node.body, nextAncestors, options);
		break;
	case 'AssignmentExpression':
	case 'AssignmentPattern':
	case 'BinaryExpression':
	case 'LogicalExpression':
		yield* walker(node.left, nextAncestors, options);
		yield* walker(node.right, nextAncestors, options);
		break;
	case 'AwaitExpression':
	case 'RestElement':
	case 'ReturnStatement':
	case 'SpreadElement':
	case 'ThrowStatement':
	case 'UnaryExpression':
	case 'UpdateExpression':
	case 'YieldExpression':
		yield* walker(node.argument, nextAncestors, options);
		break;
	case 'BlockStatement':
	case 'ClassBody':
	case 'Program':
		yield* arrayWalker(node.body, nextAncestors, options);
		break;
	case 'BreakStatement':
	case 'ContinueStatement':
		yield* walker(node.label, nextAncestors, options);
		break;
	case 'CallExpression':
	case 'NewExpression':
		yield* walker(node.callee, nextAncestors, options);
		yield* arrayWalker(node.arguments, nextAncestors, options);
		break;
	case 'CatchClause':
		yield* walker(node.param, nextAncestors, options);
		yield* walker(node.body, nextAncestors, options);
		break;
	case 'ClassDeclaration':
	case 'ClassExpression':
		yield* walker(node.id, nextAncestors, options);
		yield* walker(node.superClass, nextAncestors, options);
		yield* walker(node.body, nextAncestors, options);
		break;
	case 'ConditionalExpression':
	case 'IfStatement':
		yield* walker(node.test, nextAncestors, options);
		yield* walker(node.consequent, nextAncestors, options);
		yield* walker(node.alternate, nextAncestors, options);
		break;
	case 'DebuggerStatement':
	case 'EmptyStatement':
	case 'Identifier':
	case 'Literal':
	case 'MetaProperty':
	case 'Super':
	case 'TemplateElement':
	case 'ThisExpression':
		break;
	case 'DoWhileStatement':
		yield* walker(node.body, nextAncestors, options);
		yield* walker(node.test, nextAncestors, options);
		break;
	case 'ExportAllDeclaration':
		yield* walker(node.source, nextAncestors, options);
		break;
	case 'ExportDefaultDeclaration':
		yield* walker(node.declaration, nextAncestors, options);
		break;
	case 'ExportNamedDeclaration':
		yield* walker(node.declaration, nextAncestors, options);
		yield* arrayWalker(node.specifiers, nextAncestors, options);
		yield* walker(node.source, nextAncestors, options);
		break;
	case 'ExportSpecifier':
		yield* walker(node.local, nextAncestors, options);
		// yield* walker(node.exported, nextAncestors, options);
		break;
	case 'ExpressionStatement':
	case 'ParenthesizedExpression':
		yield* walker(node.expression, nextAncestors, options);
		break;
	case 'ForInStatement':
	case 'ForOfStatement':
		yield* walker(node.left, nextAncestors, options);
		yield* walker(node.right, nextAncestors, options);
		yield* walker(node.body, nextAncestors, options);
		break;
	case 'ForStatement':
		yield* walker(node.init, nextAncestors, options);
		yield* walker(node.test, nextAncestors, options);
		yield* walker(node.update, nextAncestors, options);
		yield* walker(node.body, nextAncestors, options);
		break;
	case 'ImportDeclaration':
		yield* arrayWalker(node.specifiers, nextAncestors, options);
		yield* walker(node.source, nextAncestors, options);
		break;
	case 'ImportDefaultSpecifier':
	case 'ImportNamespaceSpecifier':
		yield* walker(node.local, nextAncestors, options);
		break;
	case 'ImportSpecifier':
		// yield* walker(node.imported, nextAncestors, options);
		yield* walker(node.local, nextAncestors, options);
		break;
	case 'LabeledStatement':
		yield* walker(node.label, nextAncestors, options);
		yield* walker(node.body, nextAncestors, options);
		break;
	case 'MemberExpression':
		yield* walker(node.object, nextAncestors, options);
		yield* walker(node.property, nextAncestors, options);
		break;
	case 'MethodDefinition':
	case 'Property':
		yield* walker(node.key, nextAncestors, options);
		yield* walker(node.value, nextAncestors, options);
		break;
	case 'ObjectExpression':
	case 'ObjectPattern':
		yield* arrayWalker(node.properties, nextAncestors, options);
		break;
	case 'SequenceExpression':
		yield* arrayWalker(node.expressions, nextAncestors, options);
		break;
	case 'SwitchCase':
		yield* walker(node.test, nextAncestors, options);
		yield* arrayWalker(node.consequent, nextAncestors, options);
		break;
	case 'SwitchStatement':
		yield* walker(node.discriminant, nextAncestors, options);
		yield* arrayWalker(node.cases, nextAncestors, options);
		break;
	case 'TaggedTemplateExpression':
		yield* walker(node.tag, nextAncestors, options);
		yield* walker(node.quasi, nextAncestors, options);
		break;
	case 'TemplateLiteral':
		for (let i = 0; i < node.quasis.length; i++) {
			yield* walker(node.quasis[i], nextAncestors, options);
			yield* walker(node.expressions[i], nextAncestors, options);
		}
		break;
	case 'TryStatement':
		yield* walker(node.block, nextAncestors, options);
		yield* walker(node.handler, nextAncestors, options);
		yield* walker(node.finalizer, nextAncestors, options);
		break;
	case 'VariableDeclaration':
		yield* arrayWalker(node.declarations, nextAncestors, options);
		break;
	case 'VariableDeclarator':
		yield* walker(node.id, nextAncestors, options);
		yield* walker(node.init, nextAncestors, options);
		break;
	case 'WhileStatement':
		yield* walker(node.test, nextAncestors, options);
		yield* walker(node.body, nextAncestors, options);
		break;
	case 'WithStatement':
		yield* walker(node.object, nextAncestors, options);
		yield* walker(node.body, nextAncestors, options);
		break;
	default:
		throw new Error(`Unknown type: ${node.type}`);
	}
}

function* arrayWalker(nodes, nextAncestors, options) {
	for (const node of nodes) {
		yield* walker(node, nextAncestors, options);
	}
}

module.exports = walker;
