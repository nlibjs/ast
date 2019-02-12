exports.defaultGeneratorOptions = {
    AwaitExpression: {
        'await': 'await ',
    },
    BreakStatement: {
        'break'(node) {
            return `break${node.label ? ' ' : ''}`;
        },
    },
    ClassDeclaration: {
        'class': 'class ',
        'extends': ' extends ',
    },
    ClassExpression: {
        'class': 'class ',
        'extends': ' extends ',
    },
    ContinueStatement: {
        'continue': 'continue ',
    },
    ExportAllDeclaration: {
        'export': 'export ',
        '*': '* ',
        'from': 'from ',
    },
    ExportDefaultDeclaration: {
        'export': 'export ',
        'default': 'default ',
    },
    ExportNamedDeclaration: {
        'export': 'export ',
    },
    ExportSpecifier: {
        'as': ' as ',
    },
    ForInStatement: {
        'in': ' in ',
    },
    ForOfStatement: {
        'of': ' of ',
    },
    FunctionDeclaration: {
        'async': 'async ',
        'function': 'function ',
        'function*': 'function* ',
    },
    FunctionExpression: {
        'async': 'async ',
        'function'(node) {
            return `function${node.id ? ' ' : ''}`;
        },
        'function*'(node) {
            return `function*${node.id ? ' ' : ''}`;
        },
    },
    ImportDeclaration: {
        'import': 'import ',
        'from': ' from ',
    },
    ImportNamespaceSpecifier: {
        'as': ' as ',
    },
    ImportSpecifier: {
        'as': ' as ',
    },
    MethodDefinition: {
        'static': 'static ',
        'get': 'get ',
        'set': 'set ',
        'async': 'async ',
    },
    NewExpression: {
        'new': 'new ',
    },
    Property: {
        'get': 'get ',
        'set': 'set ',
    },
    ReturnStatement: {
        'return'(node) {
            return `return${node.argument ? ' ' : ''}`;
        },
    },
    SwitchCase: {
        'case': 'case ',
    },
    ThrowStatement: {
        'throw': 'throw ',
    },
    UnaryExpression: {
        'delete': 'delete ',
        'typeof': 'typeof ',
        'void': 'void ',
    },
    VariableDeclaration: {
        'var': 'var ',
        'let': 'let ',
        'const': 'const ',
    },
    YieldExpression: {
        'yield': 'yield ',
        'yield*': 'yield* ',
    },
};
