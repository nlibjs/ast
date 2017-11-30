const precedences = require('../precedences');

function isWeakOperator(operator1, operator2) {
	if (!operator1) {
		return false;
	} else if (!operator2) {
		return true;
	}
	return precedences[operator1] < precedences[operator2];
}

module.exports = isWeakOperator;
