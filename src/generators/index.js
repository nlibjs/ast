const generators = {
	ArrayExpression(node, fn, w, a) {
		for (const child of node.elements) {
			walk(child, fn, w, a);
		}
	},
	ArrayPattern(node, fn, w, a) {
		for (const child of node.elements) {
			walk(child, fn, w, a);
		}
	},
	ArrowFunctionExpression(node, fn, w, a) {
		walk(node.id, fn, w, a);
		for (const child of node.params) {
			walk(child, fn, w, a);
		}
		walk(node.body, fn, w, a);
	},
	AssignmentExpression(node, fn, w, a) {
		walk(node.left, fn, w, a);
		walk(node.right, fn, w, a);
	},
	AssignmentPattern(node, fn, w, a) {
		walk(node.left, fn, w, a);
		walk(node.right, fn, w, a);
	},
	AwaitExpression(node, fn, w, a) {
		walk(node.argument, fn, w, a);
	},
	BinaryExpression(node, fn, w, a) {
		walk(node.left, fn, w, a);
		walk(node.right, fn, w, a);
	},
	BlockStatement(node, fn, w, a) {
		for (const child of node.body) {
			walk(child, fn, w, a);
		}
	},
	BreakStatement(node, fn, w, a) {
		walk(node.label, fn, w, a);
	},
	CallExpression(node, fn, w, a) {
		walk(node.callee, fn, w, a);
		for (const child of node.arguments) {
			walk(child, fn, w, a);
		}
	},
	CatchClause(node, fn, w, a) {
		walk(node.param, fn, w, a);
		walk(node.body, fn, w, a);
	},
	ClassBody(node, fn, w, a) {
		for (const child of node.body) {
			walk(child, fn, w, a);
		}
	},
	ClassDeclaration(node, fn, w, a) {
		walk(node.id, fn, w, a);
		walk(node.superClass, fn, w, a);
		walk(node.body, fn, w, a);
	},
	ClassExpression(node, fn, w, a) {
		walk(node.id, fn, w, a);
		walk(node.superClass, fn, w, a);
		walk(node.body, fn, w, a);
	},
	ConditionalExpression(node, fn, w, a) {
		walk(node.test, fn, w, a);
		walk(node.consequent, fn, w, a);
		walk(node.alternate, fn, w, a);
	},
	ContinueStatement(node, fn, w, a) {
		walk(node.label, fn, w, a);
	},
	DebuggerStatement: skip,
	DoWhileStatement(node, fn, w, a) {
		walk(node.body, fn, w, a);
		walk(node.test, fn, w, a);
	},
	EmptyStatement: skip,
	ExportAllDeclaration(node, fn, w, a) {
		walk(node.source, fn, w, a);
	},
	ExportDefaultDeclaration(node, fn, w, a) {
		walk(node.declaration, fn, w, a);
	},
	ExportNamedDeclaration(node, fn, w, a) {
		walk(node.declaration, fn, w, a);
		for (const child of node.specifiers) {
			walk(child, fn, w, a);
		}
		walk(node.source, fn, w, a);
	},
	ExportSpecifier(node, fn, w, a) {
		walk(node.local, fn, w, a);
		// walk(node.exported, fn, w, a);
	},
	ExpressionStatement(node, fn, w, a) {
		walk(node.expression, fn, w, a);
	},
	ForInStatement(node, fn, w, a) {
		walk(node.left, fn, w, a);
		walk(node.right, fn, w, a);
		walk(node.body, fn, w, a);
	},
	ForOfStatement(node, fn, w, a) {
		walk(node.left, fn, w, a);
		walk(node.right, fn, w, a);
		walk(node.body, fn, w, a);
	},
	ForStatement(node, fn, w, a) {
		walk(node.init, fn, w, a);
		walk(node.test, fn, w, a);
		walk(node.update, fn, w, a);
		walk(node.body, fn, w, a);
	},
	FunctionDeclaration(node, fn, w, a) {
		walk(node.id, fn, w, a);
		for (const child of node.params) {
			walk(child, fn, w, a);
		}
		walk(node.body, fn, w, a);
	},
	FunctionExpression(node, fn, w, a) {
		walk(node.id, fn, w, a);
		for (const child of node.params) {
			walk(child, fn, w, a);
		}
		walk(node.body, fn, w, a);
	},
	Identifier: skip,
	IfStatement(node, fn, w, a) {
		walk(node.test, fn, w, a);
		walk(node.consequent, fn, w, a);
		walk(node.alternate, fn, w, a);
	},
	ImportDeclaration(node, fn, w, a) {
		for (const child of node.specifiers) {
			walk(child, fn, w, a);
		}
		walk(node.source, fn, w, a);
	},
	ImportDefaultSpecifier(node, fn, w, a) {
		walk(node.local, fn, w, a);
	},
	ImportNamespaceSpecifier(node, fn, w, a) {
		walk(node.local, fn, w, a);
	},
	ImportSpecifier(node, fn, w, a) {
		// walk(node.imported, fn, w, a);
		walk(node.local, fn, w, a);
	},
	LabeledStatement(node, fn, w, a) {
		walk(node.label, fn, w, a);
		walk(node.body, fn, w, a);
	},
	Literal: skip,
	LogicalExpression(node, fn, w, a) {
		walk(node.left, fn, w, a);
		walk(node.right, fn, w, a);
	},
	MemberExpression(node, fn, w, a) {
		walk(node.object, fn, w, a);
		walk(node.property, fn, w, a);
	},
	// MetaProperty(node, fn, w, a) {
	// 	walk(node.meta, fn, w, a);
	// 	walk(node.property, fn, w, a);
	// },
	MetaProperty: skip,
	MethodDefinition(node, fn, w, a) {
		walk(node.key, fn, w, a);
		walk(node.value, fn, w, a);
	},
	NewExpression(node, fn, w, a) {
		walk(node.callee, fn, w, a);
		for (const child of node.arguments) {
			walk(child, fn, w, a);
		}
	},
	ObjectExpression(node, fn, w, a) {
		for (const child of node.properties) {
			walk(child, fn, w, a);
		}
	},
	ObjectPattern(node, fn, w, a) {
		for (const child of node.properties) {
			walk(child, fn, w, a);
		}
	},
	ParenthesizedExpression(node, fn, w, a) {
		walk(node.expression, fn, w, a);
	},
	Program(node, fn, w, a) {
		for (const child of node.body) {
			walk(child, fn, w, a);
		}
	},
	Property(node, fn, w, a) {
		walk(node.key, fn, w, a);
		walk(node.value, fn, w, a);
	},
	RestElement(node, fn, w, a) {
		walk(node.argument, fn, w, a);
	},
	ReturnStatement(node, fn, w, a) {
		walk(node.argument, fn, w, a);
	},
	SequenceExpression(node, fn, w, a) {
		for (const child of node.expressions) {
			walk(child, fn, w, a);
		}
	},
	SpreadElement(node, fn, w, a) {
		walk(node.argument, fn, w, a);
	},
	Super: skip,
	SwitchCase(node, fn, w, a) {
		walk(node.test, fn, w, a);
		for (const child of node.consequent) {
			walk(child, fn, w, a);
		}
	},
	SwitchStatement(node, fn, w, a) {
		walk(node.discriminant, fn, w, a);
		for (const child of node.cases) {
			walk(child, fn, w, a);
		}
	},
	TaggedTemplateExpression(node, fn, w, a) {
		walk(node.tag, fn, w, a);
		walk(node.quasi, fn, w, a);
	},
	TemplateElement: skip,
	TemplateLiteral({expressions, quasis}, fn, w, a) {
		for (let i = 0; i < quasis.length; i++) {
			walk(quasis[i], fn, w, a);
			walk(expressions[i], fn, w, a);
		}
	},
	ThisExpression: skip,
	ThrowStatement(node, fn, w, a) {
		walk(node.argument, fn, w, a);
	},
	TryStatement(node, fn, w, a) {
		walk(node.block, fn, w, a);
		walk(node.handler, fn, w, a);
		walk(node.finalizer, fn, w, a);
	},
	UnaryExpression(node, fn, w, a) {
		walk(node.argument, fn, w, a);
	},
	UpdateExpression(node, fn, w, a) {
		walk(node.argument, fn, w, a);
	},
	VariableDeclaration(node, fn, w, a) {
		for (const child of node.declarations) {
			walk(child, fn, w, a);
		}
	},
	VariableDeclarator(node, fn, w, a) {
		walk(node.id, fn, w, a);
		walk(node.init, fn, w, a);
	},
	WhileStatement(node, fn, w, a) {
		walk(node.test, fn, w, a);
		walk(node.body, fn, w, a);
	},
	WithStatement(node, fn, w, a) {
		walk(node.object, fn, w, a);
		walk(node.body, fn, w, a);
	},
	YieldExpression(node, fn, w, a) {
		walk(node.argument, fn, w, a);
	},
};
