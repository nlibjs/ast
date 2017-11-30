const {Readable} = require('stream');
const {generator} = require('..');

class Generator extends Readable {

	constructor(ast, options) {
		super().generator = generator(ast, options);
	}

	_read() {
		for (const code of this.generator) {
			this.push(code);
		}
		this.push(null);
	}

}

module.exports = Generator;
