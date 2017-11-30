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

module.exports = [
	...Object.keys(base),
	'ClassBody',
	'ExportSpecifier',
	'SwitchCase',
	'TemplateElement',
]
.filter((type) => {
	return !groups.has(type);
})
.sort();
