// GLOBAL LOOP VARIABLES
var start, end;

// For drawing lines where the input coordinates are in WGS84 units
function drawLine(lon1, lon2, lat1, lat2) {
	start = wgsToScreen(lon1, lat1);
	end = wgsToScreen(lon2, lat2);
	ctx.moveTo(start.x + .5, start.y + .5);
	ctx.lineTo(end.x + .5, end.y + .5);
}

// For drawing lines where the input coordinates are in Web Mercator units
function drawLineWm(x1, x2, y1, y2) {
	start = wmToScreen(x1, y1);
	end = wmToScreen(x2, y2);
	ctx.moveTo(start.x + .5, start.y + .5);
	ctx.lineTo(end.x + .5, end.y + .5);
}

function drawShadowLine(lon1, lon2, lat1, lat2) {
	var start = wgsToScreen(lon1, lat1);
	var end = wgsToScreen(lon2, lat2);
	shadowctx.moveTo(start.x, start.y);
	shadowctx.lineTo(end.x, end.y);
}

function drawText(lon, lat, options) {
	options = options || { 'label': '', 'size': 12, 'color': '#FFF' };
	var point = wgsToScreen(lon, lat);
	ctx.font = options.size + 'px Consolas';
	ctx.fillStyle = options.color;
	ctx.fillText(options.label, point.x, point.y);
}

function drawPoint(lon, lat, options) {
	options = options || {};
	var point = wgsToScreen(lon, lat);
	ctx.beginPath();
	ctx.fillStyle = options.color || 'white';
	ctx.arc(point.x, point.y, options.size || 2, 0, (options.size || 2) * Math.PI, false);
	ctx.fill();
	if (options.label) {
		ctx.font = options.textSize + 'px Arial';
		ctx.fillText(options.label, point.x + 8, point.y - 8);
	}
}

function drawPolyLine() {
	// TODO
}

function drawPoly(renderItem) {
	for (var i = 0; i < renderItem.points.length; i++) {
		if (i + 1 < renderItem.points.length) {
			drawLine(renderItem.points[i].x, renderItem.points[i + 1].x, renderItem.points[i].y, renderItem.points[i + 1].y);
		}
		else {
			// connect back to start
			drawLine(renderItem.points[i].x, renderItem.points[0].x, renderItem.points[i].y, renderItem.points[0].y);
		}
	}
}