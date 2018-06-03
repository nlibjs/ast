const test = require('@nlib/test');
const acorn = require('acorn');
const {
	uncommenter,
	commentTokenizer,
	parseComment,
	parseComments,
} = require('../..');

const items = [
	{
		text: '',
		uncommenter: {length: 0},
		commentTokenizer: {length: 0},
		parseComment: {},
	},
	{
		text: ' // aaa \n',
		uncommenter: {
			length: 1,
			0: '// aaa',
		},
		commentTokenizer: {
			length: 1,
			0: {
				length: 2,
				0: '_',
				1: '// aaa',
			},
		},
		parseComment: {
			_: {
				length: 1,
				0: '// aaa',
			},
		},
	},
	{
		text: `
		* @aaa aaa
		* bbb
		* ccc
		@ddd eee
		fff
		@aaa eee
		fff
		`,
		uncommenter: {
			length: 7,
			0: '@aaa aaa',
			1: 'bbb',
			2: 'ccc',
			3: '@ddd eee',
			4: 'fff',
			5: '@aaa eee',
			6: 'fff',
		},
		commentTokenizer: {
			length: 3,
			0: ['aaa', 'aaa\nbbb\nccc'],
			1: ['ddd', 'eee\nfff'],
			2: ['aaa', 'eee\nfff'],
		},
		parseComment: {
			aaa: ['aaa\nbbb\nccc', 'eee\nfff'],
			ddd: ['eee\nfff'],
		},
	},
];

test('uncommenter', (test) => {

	for (const item of items) {
		test(JSON.stringify(item.text), (test) => {
			test.compare(
				[...uncommenter(item.text)],
				item.uncommenter
			);
		});
	}

});

test('commentTokenizer', (test) => {

	for (const item of items) {
		test(JSON.stringify(item.text), (test) => {
			test.compare(
				[...commentTokenizer(item.text)],
				item.commentTokenizer
			);
		});
	}

});

test('parseComment', (test) => {

	for (const item of items) {
		test(JSON.stringify(item.text), (test) => {
			test.compare(
				parseComment(item.text),
				item.parseComment
			);
		});
	}

});

test('parseComments', (test) => {

	const items = [
		{
			code: `
			/**
				aaa
				@bbb ccc
			*/
			class AAA {
				/**
					@ddd eee
					@fff ggg
				*/
				foo() {}
			}
			/**
				aaa
				@bbb ccc
			*/
			export class BBB {}
			`,
			comments: {
				length: 3,
				0: {
					data: {
						_: ['aaa'],
						bbb: ['ccc'],
					},
					node: {
						type: 'ClassDeclaration',
						id: {name: 'AAA'},
					},
				},
				1: {
					data: {
						ddd: ['eee'],
						fff: ['ggg'],
					},
					node: {
						type: 'MethodDefinition',
						key: {name: 'foo'},
					},
				},
				2: {
					data: {
						_: ['aaa'],
						bbb: ['ccc'],
					},
					node: {
						type: 'ExportNamedDeclaration',
						declaration: {
							type: 'ClassDeclaration',
							id: {name: 'BBB'},
						},
					},
				},
			},
		},
	];

	for (const item of items) {
		test(JSON.stringify(item.text), (test) => {
			const comments = [];
			const ast = acorn.parse(item.code, {
				sourceType: 'module',
				onComment: comments,
			});
			test.compare(
				parseComments(item.code, ast, comments),
				item.comments
			);
		});
	}

});
