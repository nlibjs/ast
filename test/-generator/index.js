import assert from 'assert';
import test from '@nlib/test';
import acorn from 'acorn';
import Generator from '../../src/-generator/index.js';
import walker from '../../src/walker/index.js';
import types from '../types/index.js';
import generatorTests from '../generator-tests/index.js';

test('Generator', (test) => {

	const coverage = new Map(
		types
		.map((type) => {
			return [type, 0];
		})
	);

	for (const [code, acornOptions = {}] of generatorTests.simple) {
		test(JSON.stringify([code, acornOptions]), () => {
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
		});
	}

	test('coverage', (test) => {
		for (const [type, count] of coverage) {
			test(`${type}: ${count}`, () => {
				assert(0 < count);
			});
		}
	});

});
