const {walker} = require('../walker');

function* uncommenter(comment) {
	for (const line of comment.split(/\s*\n\s*/)) {
		if (line.match(/[^/*\s]/)) {
			const body = line.replace(/^\s*(?:\*+\s*)?/, '').trim();
			if (body) {
				yield body;
			}
		}
	}
}

function* commentTokenizer(comment) {
	let context = '_';
	const buffer = [];
	for (const line of uncommenter(comment)) {
		const matched = line.match(/^@(\w+)\s+(.*)$/);
		if (matched) {
			yield* flush();
			[, context, buffer[0]] = matched;
		} else {
			buffer.push(line);
		}
	}
	yield* flush();
	function* flush() {
		if (0 < buffer.length) {
			yield [context, buffer.splice(0, buffer.length).join('\n')];
		}
	}
}

function parseComment(comment) {
	const result = {};
	for (const [key, value] of commentTokenizer(comment)) {
		if (key in result) {
			result[key].push(value);
		} else {
			result[key] = [value];
		}
	}
	return result;
}

function parseComments(code, ast, arrayOfComments) {
	const astWalker = walker(ast);
	const comments = [];
	let previousEnd = 0;
	let buffer;
	const flush = (start = previousEnd) => {
		if (buffer && 0 < buffer.length) {
			const {start, end} = buffer;
			const data = parseComment(buffer.join('\n'));
			while (1) {
				const {done, value: node} = astWalker.next();
				if (done || end < node.start) {
					comments.push({start, end, node, data});
					break;
				}
			}
		}
		buffer = [];
		buffer.start = start;
	};
	flush();
	for (const {type, value, start, end} of arrayOfComments) {
		if (type === 'Block' && value.startsWith('*')) {
			const skippedCode = code.slice(previousEnd, start).trim();
			const targetNodeIsChanged = 0 < skippedCode.length;
			if (targetNodeIsChanged) {
				flush(start);
			}
			buffer.end = end;
			buffer.push(value);
			previousEnd = end;
		}
	}
	flush();
	return comments;
}

Object.assign(exports, {
	uncommenter,
	commentTokenizer,
	parseComment,
	parseComments,
});
