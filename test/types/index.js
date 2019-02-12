const {base} = require('acorn/dist/walk');
const groups = new Set([
    'Class',
    'Expression',
    'ForInit',
    'Function',
    'MemberPattern',
    'Pattern',
    'ScopeBody',
    'ScopeExpression',
    'Statement',
    'VariablePattern',
]);
exports.types = [
    ...Object.keys(base),
    'ClassBody',
    'ExportSpecifier',
    'SwitchCase',
    'TemplateElement',
]
.filter((type) => !groups.has(type))
.sort();
