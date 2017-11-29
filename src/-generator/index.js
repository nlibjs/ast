import {Readable} from 'stream';
import generator from '../generator/index.js';

export default class Generator extends Readable {

	constructor(ast) {
		super().generator = generator(ast);
	}

	_read() {
		for (const code of this.generator) {
			this.push(code);
		}
		this.push(null);
	}

}
