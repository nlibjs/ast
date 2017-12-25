module.exports = walker;
function* walker(node, options, ancestors) {
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
		yield* arrayWalker(node.elements, options, nextAncestors);
		break;
	case 'ArrowFunctionExpression':
	case 'FunctionDeclaration':
	case 'FunctionExpression':
		yield* walker(node.id, options, nextAncestors);
		yield* arrayWalker(node.params, options, nextAncestors);
		yield* walker(node.body, options, nextAncestors);
		break;
	case 'AssignmentExpression':
	case 'AssignmentPattern':
	case 'BinaryExpression':
	case 'LogicalExpression':
		yield* walker(node.left, options, nextAncestors);
		yield* walker(node.right, options, nextAncestors);
		break;
	case 'AwaitExpression':
	case 'RestElement':
	case 'ReturnStatement':
	case 'SpreadElement':
	case 'ThrowStatement':
	case 'UnaryExpression':
	case 'UpdateExpression':
	case 'YieldExpression':
		yield* walker(node.argument, options, nextAncestors);
		break;
	case 'BlockStatement':
	case 'ClassBody':
	case 'Program':
		yield* arrayWalker(node.body, options, nextAncestors);
		break;
	case 'BreakStatement':
	case 'ContinueStatement':
		yield* walker(node.label, options, nextAncestors);
		break;
	case 'CallExpression':
	case 'NewExpression':
		yield* walker(node.callee, options, nextAncestors);
		yield* arrayWalker(node.arguments, options, nextAncestors);
		break;
	case 'CatchClause':
		yield* walker(node.param, options, nextAncestors);
		yield* walker(node.body, options, nextAncestors);
		break;
	case 'ClassDeclaration':
	case 'ClassExpression':
		yield* walker(node.id, options, nextAncestors);
		yield* walker(node.superClass, options, nextAncestors);
		yield* walker(node.body, options, nextAncestors);
		break;
	case 'ConditionalExpression':
	case 'IfStatement':
		yield* walker(node.test, options, nextAncestors);
		yield* walker(node.consequent, options, nextAncestors);
		yield* walker(node.alternate, options, nextAncestors);
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
		yield* walker(node.body, options, nextAncestors);
		yield* walker(node.test, options, nextAncestors);
		break;
	case 'ExportAllDeclaration':
		yield* walker(node.source, options, nextAncestors);
		break;
	case 'ExportDefaultDeclaration':
		yield* walker(node.declaration, options, nextAncestors);
		break;
	case 'ExportNamedDeclaration':
		yield* walker(node.declaration, options, nextAncestors);
		yield* arrayWalker(node.specifiers, options, nextAncestors);
		yield* walker(node.source, options, nextAncestors);
		break;
	case 'ExportSpecifier':
		yield* walker(node.local, options, nextAncestors);
		// yield* walker(node.exported, options, nextAncestors);
		break;
	case 'ExpressionStatement':
	case 'ParenthesizedExpression':
		yield* walker(node.expression, options, nextAncestors);
		break;
	case 'ForInStatement':
	case 'ForOfStatement':
		yield* walker(node.left, options, nextAncestors);
		yield* walker(node.right, options, nextAncestors);
		yield* walker(node.body, options, nextAncestors);
		break;
	case 'ForStatement':
		yield* walker(node.init, options, nextAncestors);
		yield* walker(node.test, options, nextAncestors);
		yield* walker(node.update, options, nextAncestors);
		yield* walker(node.body, options, nextAncestors);
		break;
	case 'ImportDeclaration':
		yield* arrayWalker(node.specifiers, options, nextAncestors);
		yield* walker(node.source, options, nextAncestors);
		break;
	case 'ImportDefaultSpecifier':
	case 'ImportNamespaceSpecifier':
		yield* walker(node.local, options, nextAncestors);
		break;
	case 'ImportSpecifier':
		// yield* walker(node.imported, options, nextAncestors);
		yield* walker(node.local, options, nextAncestors);
		break;
	case 'LabeledStatement':
		yield* walker(node.label, options, nextAncestors);
		yield* walker(node.body, options, nextAncestors);
		break;
	case 'MemberExpression':
		yield* walker(node.object, options, nextAncestors);
		yield* walker(node.property, options, nextAncestors);
		break;
	case 'MethodDefinition':
	case 'Property':
		yield* walker(node.key, options, nextAncestors);
		yield* walker(node.value, options, nextAncestors);
		break;
	case 'ObjectExpression':
	case 'ObjectPattern':
		yield* arrayWalker(node.properties, options, nextAncestors);
		break;
	case 'SequenceExpression':
		yield* arrayWalker(node.expressions, options, nextAncestors);
		break;
	case 'SwitchCase':
		yield* walker(node.test, options, nextAncestors);
		yield* arrayWalker(node.consequent, options, nextAncestors);
		break;
	case 'SwitchStatement':
		yield* walker(node.discriminant, options, nextAncestors);
		yield* arrayWalker(node.cases, options, nextAncestors);
		break;
	case 'TaggedTemplateExpression':
		yield* walker(node.tag, options, nextAncestors);
		yield* walker(node.quasi, options, nextAncestors);
		break;
	case 'TemplateLiteral':
		for (let i = 0; i < node.quasis.length; i++) {
			yield* walker(node.quasis[i], options, nextAncestors);
			yield* walker(node.expressions[i], options, nextAncestors);
		}
		break;
	case 'TryStatement':
		yield* walker(node.block, options, nextAncestors);
		yield* walker(node.handler, options, nextAncestors);
		yield* walker(node.finalizer, options, nextAncestors);
		break;
	case 'VariableDeclaration':
		yield* arrayWalker(node.declarations, options, nextAncestors);
		break;
	case 'VariableDeclarator':
		yield* walker(node.id, options, nextAncestors);
		yield* walker(node.init, options, nextAncestors);
		break;
	case 'WhileStatement':
		yield* walker(node.test, options, nextAncestors);
		yield* walker(node.body, options, nextAncestors);
		break;
	case 'WithStatement':
		yield* walker(node.object, options, nextAncestors);
		yield* walker(node.body, options, nextAncestors);
		break;
	default:
		throw new Error(`Unknown type: ${node.type}`);
	}
}

function* arrayWalker(nodes, options, nextAncestors) {
	for (const node of nodes) {
		yield* walker(node, options, nextAncestors);
	}
}
