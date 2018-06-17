const chalk = require('chalk');
const {walker} = require('../walker/index.js');
const {analyze} = require('../analyze/index.js');

const print = (ast) => {
	analyze(ast);
	const indentUnit = '|  ';
	const uidDigits = Math.ceil(1 + Math.log10(ast.nodeCount));
	const uidIndent = ' '.repeat(uidDigits + 1);
	const lines = [];
	for (const node of walker(ast)) {
		const indent = chalk.dim(indentUnit.repeat(node.ancestors.length));
		let line = `${chalk.yellow(`${node.uid}`.padStart(uidDigits, ' '))} `;
		line += `${indent}${node.type}`;
		if (node.name) {
			line += `: ${chalk.cyan(node.name)}`;
		}
		if (node.type === 'Identifier') {
			if (node.declaration) {
				line += ' declared at ';
				line += chalk.dim(`@${node.declaration.type}`);
				line += chalk.yellow(`(${node.declaration.uid})`);
			} else {
				line += ` ${chalk.red('undefined')}`;
			}
		}
		if (node.operator) {
			line += `: ${chalk.cyan(node.operator)}`;
		}
		if (node.raw) {
			line += `: ${chalk.magenta(node.raw)}`;
		}
		if (node.scope) {
			line += ' (scope)';
			lines.push(line);
			for (const [name, {declaration}] of node.scope) {
				line = `${uidIndent}${indent}- ${chalk.cyan(name)}`;
				if (declaration) {
					line += ' ';
					line += chalk.dim(`@${declaration.type}`);
					line += chalk.yellow(`(${declaration.uid})`);
				} else {
					line += ' !undefined';
				}
				lines.push(line);
			}
			line = '';
		}
		if (line) {
			lines.push(line);
		}
	}
	return lines.join('\n');
};

Object.assign(exports, {
	print,
});
