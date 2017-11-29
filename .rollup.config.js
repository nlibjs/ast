import multiEntry from 'rollup-plugin-multi-entry';

export default [
	{
		input: './src/index.js',
		output: [
			{file: 'dist/index.js', format: 'cjs'},
		],
	},
	{
		input: [
			'./test/walker/index.js',
			'./test/walk/index.js',
			'./test/generator/index.js',
			'./test/-generator/index.js',
		],
		plugins: [
			multiEntry(),
		],
		output: [
			{file: 'test/index.js', format: 'cjs'},
		],
	},
];
