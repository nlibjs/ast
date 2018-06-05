const t = require('tap');
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

t.test('uncommenter', (t) => {
	for (const item of items) {
		t.test(JSON.stringify(item.text), (t) => {
			t.match(
				[...uncommenter(item.text)],
				item.uncommenter
			);
			t.end();
		});
	}
	t.end();
});

t.test('commentTokenizer', (t) => {
	for (const item of items) {
		t.test(JSON.stringify(item.text), (t) => {
			t.match(
				[...commentTokenizer(item.text)],
				item.commentTokenizer
			);
			t.end();
		});
	}
	t.end();
});

t.test('parseComment', (t) => {
	for (const item of items) {
		t.test(JSON.stringify(item.text), (t) => {
			t.match(
				parseComment(item.text),
				item.parseComment
			);
			t.end();
		});
	}
	t.end();
});

t.test('parseComments', (t) => {

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
		t.test(JSON.stringify(item.code), (t) => {
			const comments = [];
			const ast = acorn.parse(item.code, {
				sourceType: 'module',
				onComment: comments,
			});
			const actual = parseComments(item.code, ast, comments);
			t.test('start and end', (t) => {
				let previousEnd = 0;
				for (const {start, end} of actual) {
					t.ok(previousEnd <= start);
					t.ok(start < end);
					previousEnd = end;
				}
				t.end();
			});
			t.match(actual, item.comments);
			t.end();
		});
	}
	t.end();
});
