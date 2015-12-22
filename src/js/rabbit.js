/* TODO list
	- slight px jump when mouseup event re-renders
	- fix offset between terrain and shapefile
	- get rid of center.x/y?
*/

/* Performance notes
	1. modifying points by .5 vs translating canvas by .5 is 4ms faster with 25k lines
	5. Single largest boost (1600%) is from batching lineto/moveto and doing stroke at the end
	6. MultiPoly seem to be slightly more expensive than MultiLine. Could I convert everything to lines?
	- Thought? Are lines more expensive than multiline? Should I convert everything to a custom format?
	7. Caching in for loops does not help in Chrome or Firefox, but are 2x improvements in Safari and IE
	8. Switches are still good to optimize for non Chrome browsers: http://jsperf.com/switch-vs-if-1
	http://www.phpied.com/rendering-repaint-reflowrelayout-restyle/
*/

// Elements
var layerContainerElement = document.getElementById('layerContainer');
var terrainElement = document.getElementById('terrain');
var viewportElement = document.getElementById('viewport');
var mapElement = document.getElementById('map');
var canvas = document.getElementById('main');
var infoZoom = document.getElementById('infoZoom');
var infoXY = document.getElementById('infoXY');
var infoLatLon = document.getElementById('infoLatLon');
var infoBounds = document.getElementById('infoBounds');
var infoFeature = document.getElementById('infoFeature');

// Page variables
var viewportCenter;

// State
var moving = false;
var bounds = {};
var debuglines = 0;
var lastHoverCheck = 0;
var debugMode = true;

// GLOBAL VARS
var visibleStates;
// Loop vars - declared once to cut down on GC
var tl, br, syo, wm, w;

// SHAPEFILE FILTERS
var primaryRoadsFilter = function(feature) {
	if (zoom < 4) { return true; }
};

// --INITIALIZATION--
//precomputeTestWmValues();

// Need to get these programmatically to translate them later
layerContainerElement.style.left = '0px';
layerContainerElement.style.top = '0px';

// Map needs to be at least the size of the viewport - still need to test for best value
var mapViewportPadding = 0;
mapElement.style.width = viewportElement.clientWidth + mapViewportPadding + 'px';
mapElement.style.height = viewportElement.clientHeight + mapViewportPadding + 'px';
centerLayersOnViewport();

var zoom = 5;
var zoomScale = [
	156412, 78206, 39103, 19551, 9776, 4888, 2444, 1222, 610.984, 305.492,
	152.746, 76.373, 38.187, 19.093, 9.547, 4.773, 2.387, 1.193, 0.596, 0.298
];
var metersPerPixel = zoomScale[zoom];
zoomTerrain();
var ctx = canvas.getContext('2d');
ctx.textBaseline = 'middle';
calcDisplayDimensions();
var center = {
	'x': viewportElement.clientWidth / 2,
	'y': viewportElement.clientHeight / 2,
	'lon': -98,
	'lat': 40,
	'movedX': 0,
	'movedY': 0
};
reCenter();
var offset = findXyOffset(center);
setBounds();
var terrainDimensions = {
	topLeftX: -16500000,
	topLeftY: 7900000,
	bottomRightX: -4400000,
	bottomRightY: 780000
};
prepPriSec();
setVisibleStates();
renderMap({ 'source': 'init' });

if (debugMode) {
	infoZoom.innerText = 'zoom: ' + zoom;
	infoZoom.style.display = 'block';
	infoXY.style.display = 'block';
	infoBounds.style.display = 'block';
}

function toggleWsrSites() {
	showWsrSites = !showWsrSites;
	renderMap({});
}

function zoomTerrain() {
	terrainElement.style.width = (77.4375 * Math.pow(2, zoom)) + 'px';
}

function tweakTerrainOffset(input, dimension) {
	switch (zoom) {
		case 4:
			if (dimension === 'x') { return input - 1; }
			else { return input; }
			break;
		case 5:
			if (dimension === 'x') { return input - 1; }
			else { return input; }
			break;
		case 6:
			if (dimension === 'x') { return input - 4; }
			else { return input - 2; }
			break;
		case 7:
			if (dimension === 'x') { return input - 8; }
			else { return input - 3; }
			break;
		default:
			return input;
	}
}

function alignTerrainWithLayerContainer() {
	// TODO rename bounds properties to be more readable
	terrainDimensions.offsetWmX = terrainDimensions.topLeftX - bounds.wmx1;
	terrainDimensions.offsetWmY = bounds.wmy1 - terrainDimensions.topLeftY;
	terrainDimensions.offsetX = terrainDimensions.offsetWmX / metersPerPixel;
	terrainDimensions.offsetY = terrainDimensions.offsetWmY / metersPerPixel;
	terrainElement.style.left = tweakTerrainOffset(terrainDimensions.offsetX, 'x') + 'px';
	terrainElement.style.top = tweakTerrainOffset(terrainDimensions.offsetY, 'y') + 'px';
}

// EVENT BINDINGS
viewportElement.addEventListener('wheel', mouseWheelHandler, false);
viewportElement.addEventListener("mousemove", mouseMoveHandler, false);
viewportElement.addEventListener("mouseup", mouseUpHandler, false);

window.addEventListener('resize', function(e) {
	calcDisplayDimensions();
	renderMap({});
});

document.body.addEventListener('keyup', function(e) {
	console.log(e.keyCode);
	switch (e.keyCode) {
		case 90:
			doZoom(-1);
			break;
		case 88:
			doZoom(1);
			break;
		case 87:
			toggleWsrSites();
			break;
	}
});

// EVENT HANDLERS
function mouseWheelHandler(e) {
	doZoom(e.deltaY < 0 ? 1 : -1, e);
}

function mouseMoveHandler(e) {
	if (e.which === 1) {
		if (e.movementX !== 0) {
			center.movedX += e.movementX;
			layerContainerElement.style.left = (parseInt(layerContainerElement.style.left.replace('px', '')) + e.movementX) + 'px';
		}
		if (e.movementY !== 0) {
			center.movedY += e.movementY;
			layerContainerElement.style.top = (parseInt(layerContainerElement.style.top.replace('px', '')) + e.movementY) + 'px';
		}
	} else {
		var relativeX = e.clientX + viewportElement.offsetLeft;
		var relativeY = e.clientY + viewportElement.offsetTop;
		var wgs = screenToWgs(relativeX, relativeY);
		infoLatLon.innerText = roundNumber(wgs.lon, 3) + ', ' + roundNumber(wgs.lat, 3);
		infoXY.innerText = 'xy: ' + (e.clientX - viewportElement.offsetLeft) + ', ' + (e.clientY - viewportElement.offsetTop);
	}
}

function mouseUpHandler() {
	moving = false;
	renderMap();
}

// TODO need to redo these because zooming isn't working right
function doZoom(dir, e) {
	if ((dir === 1 && zoom < 19) || (dir === -1 && zoom > 4)) {
		var options = { 'source': 'zoom' };
		// Need wheel event for cursor offset
		if (e) {
			options.mouseWheel = true;
			// Relationship status - complicated
			var po = { 'x': (center.x - viewportCenter.x) * 2, 'y': (center.y - viewportCenter.y) * 2 };
			// Get mirror vector
			var mv = { 'x': (e.offsetX - center.x) * -1, 'y': (e.offsetY - center.y + po.y) * -1 };
			// Get wgs anchor
			var awgs = screenToWgs(e.offsetX, e.offsetY);
			// Get wm of anchor
			var awm = wgsToWm(awgs.lon, awgs.lat);
			// Get wxy of anchor in new zoom
			var newZoom = (dir === 1) ? zoom + 1 : zoom - 1;
			var awxy = wmToWxy(awm.x, awm.y, zoomScale[newZoom]);
			// Apply mirror vector
			var mawxy = { 'x': awxy.x + mv.x, 'y': awxy.y - mv.y };
			// Translate to wm
			var mawm = wxyToWm(mawxy.x, mawxy.y, zoomScale[newZoom]);
			// Translate to wgs
			var mawgs = wmToWgs(mawm.x, mawm.y);
			// Set center to new mirrored anchor WGS
			center.lon = mawgs.lon;
			center.lat = mawgs.lat;
		}
		zoom += (dir === 1) ? 1 : -1;
		metersPerPixel = zoomScale[zoom];
		infoZoom.innerText = 'zoom: ' + zoom;
		// Only recalculate center on zoom
		reCenter();
		renderMap(options);
		zoomTerrain();
	}
}

/*	Reminder: disable heavy things while panning
	Reminder: put these in the order you want them layered */
function renderMap(options) {
	var start = new Date().getTime();
	options = options || {};

	// New re-centering crap
	if (center.movedX !== 0 || center.movedY !== 0) {
		// Apply translation to wx/wy
		center.wx -= center.movedX;
		center.wy += center.movedY;
		// convert wxy to wm
		var newWm = wxyToWm(center.wx, center.wy);
		center.wmx = newWm.x;
		center.wmy = newWm.y;
		// convert wm to lat/lon
		var newLatlon = wmToWgs(center.wmx, center.wmy);
		center.lat = newLatlon.lat;
		center.lon = newLatlon.lon;
		// Reset moved values
		center.movedX = 0;
		center.movedY = 0;
		centerLayersOnViewport();
	}

	offset = findXyOffset(center);
	syo = mapElement.clientHeight - offset.y;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	setBounds();
	setVisibleStates();
	//visibleStates.forEach(function(vs) { renderPriSec(vs); });
	renderStates();
	renderCities();
	//renderShapefile(usTest, { 'filterFeature': primaryRoadsFilter });
	alignTerrainWithLayerContainer();
	console.log('render time: ' + (new Date().getTime() - start) + 'ms')
}

function reCenter() {
	var wm = wgsToWm(center.lon, center.lat);
	center.wmx = wm.x;
	center.wmy = wm.y;
	var w = wmToWxy(center.wmx, center.wmy);
	center.wx = w.x;
	center.wy = w.y;
}

function findXyOffset(center) {
	return {
		'x': center.x - center.wx,
		'y': center.y - center.wy
	};
}

function setBounds() {
	// WGS84 bounds
	tl = screenToWgs(0, 0);
	br = screenToWgs(mapElement.clientWidth, mapElement.clientHeight);
	bounds.lon1 = tl.lon;
	bounds.lon2 = br.lon;
	bounds.lat1 = tl.lat;
	bounds.lat2 = br.lat;
	// Web Mercator bounds for precomputed coordinates
	tl = wgsToWm(tl.lon, tl.lat);
	br = wgsToWm(br.lon, br.lat);
	bounds.wmx1 = tl.x;
	bounds.wmx2 = br.x;
	bounds.wmy1 = tl.y;
	bounds.wmy2 = br.y;
}

function calcDisplayDimensions() {
	viewportCenter = {'x': viewportElement.clientWidth / 2, 'y': viewportElement.clientHeight / 2 };
	canvas.width = mapElement.clientWidth;
	canvas.height = mapElement.clientHeight;
}

function precomputeTestWmValues() {
	var wmValues = [];
	var start = new Date().getTime();
	for (var i = 0; i < usTest.features.length; i ++) {
		for (var j = 0; j < usTest.features[i].geometry.coordinates.length; j++) {
			wmValues = wgsToWm(usTest.features[i].geometry.coordinates[j][0], usTest.features[i].geometry.coordinates[j][1]);
			usTest.features[i].geometry.coordinates[j] = [wmValues.x, wmValues.y];
		}
	}
	usTest.wmPreComputed = true;
	console.log('Precompute WM time: ' + (new Date().getTime() - start) + 'ms');
}

function centerLayersOnViewport() {
	layerContainerElement.style.left = mapViewportPadding / -2 + 'px';
	layerContainerElement.style.top = mapViewportPadding / -2 + 'px';
}