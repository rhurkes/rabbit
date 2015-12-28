function roundNumber(rnum, rlength) { 
	return Math.round(rnum * Math.pow(10, rlength)) / Math.pow(10, rlength);
}

function capitalize(s) {
	var splits = s.split(' ');
	splits.forEach(function(s, i) { splits[i] = s[0].toUpperCase() + s.slice(1); });
	return splits.join(' ');
}

function perfTest() {
	var time = 0;
	var iterations = 100;
	debuglines = 0;
	var start;
	for (var i = 0; i < iterations; i++) {
		start = (new Date()).getTime();
		renderMap({
			'source': 'perf'
		});
		time += (new Date()).getTime() - start;
	}
	console.log('time: ' + (time / iterations) + 'ms, lines: ' + (debuglines / iterations) + ', time/10k lines: ' + (time / iterations) / (debuglines / iterations) * 10000);
}

function sortBy(field, reverse, primer) {
    var key = (primer) ?
    	function(x) { return primer(x[field]); } :
    	function(x) { return x[field]; };
    reverse = [-1, 1][+!!reverse];
    return function (a, b) {
        return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
    }
}

function padZero(number) {
	number = parseInt(number);
	return (number < 10) ? '0' + number : number.toString();
}

// TODO find faster approximation
function distanceBetweenPoints(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function isRectangleIntersect(rectA, rectB) {
	// Check for no overlap condition, then use DeMorgan's Law to invert it
	return !(rectA.left > rectB.right || rectA.right < rectB.left || rectA.top < rectB.bottom || rectA.bottom > rectB.top);
}