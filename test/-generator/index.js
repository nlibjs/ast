const assert = require('assert');
const console = require('console');
const acorn = require('acorn');
const types = require('../types');
const generatorTests = require('../generator-tests');
const {Generator, walker} = require('../..');

const coverage = new Map(
	types
	.map((type) => {
		return [type, 0];
	})
);

Promise.all(
	generatorTests.simple
	.map(([code, acornOptions = {}]) => {
		const ast = acorn.parse(code, Object.assign(
			{ecmaVersion: 8, sourceType: 'module'},
			acornOptions
		));
		for (const {type} of walker(ast)) {
			coverage.set(type, coverage.get(type) + 1);
		}
		return new Promise((resolve, reject) => {
			const chunks = [];
			let length = 0;
			new Generator(ast)
			.once('error', reject)
			.on('data', (chunk) => {
				chunks.push(chunk);
				length += chunk.length;
			})
			.once('end', () => {
				resolve(Buffer.concat(chunks, length).toString());
			});
		})
		.then((actual) => {
			assert.equal(actual, code);
		});
	})
)
.then(() => {
	for (const [type, count] of coverage) {
		assert(0 < count, `${type} is not covered`);
	}
	console.log('done');
})
.catch((error) => {
	console.error(error);
	process.exit(1);
});
