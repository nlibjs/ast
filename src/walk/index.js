import walker from '../walker/index.js';

export default function walk(ast, fn, wrappers) {
	for (const node of walker(ast, wrappers)) {
		fn(node);
	}
}
