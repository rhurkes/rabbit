// TODO/PERF Abstracting is nice, but customized render routines for each special shapefile could yield could performance
// Think about ease of development/maintainance vs speed before refactoring this either way

// Use native for loops and cache length everywhere possible. Chrome and Firefox are already highly optimized,
// but other browsers like Safari and IE can see massive performance gains.

// Check lat first, since the bounds are usually tighter and will fail sooner

// TODO image for CONUS topo + hiways at large zooms

/*
	- No difference bringing drawline function explicitly into parent
	- Bresenham line algorithm is significantly slower than native lineTo method
	- 3600 features, 150k lines, render time 44ms
	- 3600 features, 218k lines with shadow, render time 17,531ms - pretty much impossible to use this method
	- Anything more than ~400 lines is will have 1+ second delay for rendering shadow

*/
// Simplify geometry of .0001 seems to be best compromise between performance and precision

//BUGS:
//1 - Font changes after first render

// GLOBALS FOR LOOPING
var f, i, j, k;

function prepareStateData() {
	// Populate cities for each state
	for (var i = 0, len = us_cities.length; i < len; i++) {
		if (!data.states[us_cities[i].st]) {
			data.states[us_cities[i].st] = {
				'cities': [],
				'roads': {
					'prisec': {}
				},
				'counties': [],
				'rivers': []
			};
		}
		data.states[us_cities[i].st].cities.push(us_cities[i]);
	}

	// Sort cities by population
	for (var state in data.states) {
		data.states[state].cities.sort(sortBy('pop'));
	}

	// Primary/secondary roads
	/*states_prisec.forEach(function(sp) {
		var state = data.states[sp.name];
		state.roads.prisec.i = sp.ifeat;
		state.roads.prisec.u = sp.ufeat;
		state.roads.prisec.s = sp.sfeat;
		state.roads.prisec.m = sp.mfeat;
		state.roads.prisec.c = sp.cfeat;
	});*/
}

function renderCities() {
	if (zoom < 4) { return; }

	var citiesToRender = [];
	var city, point, filterFunction = function() { return true; }, statePoints, cityLimit, cityCount;

	for (var state in visibleStates) {
		statePoints = cities[visibleStates[state]];
		for (i = 0; i < statePoints.length; i++) {
			city = statePoints[i];
			if (city.zoom <= zoom) {
				citiesToRender.push(statePoints[i]);
			}
		}
	}

	ctx.font = '10px Roboto';
	ctx.fillStyle = '#000';
	for (i = 0; i < citiesToRender.length; i++) {
		city = citiesToRender[i];
		point = wgsToScreen(city.lon, city.lat);
		ctx.fillText(city.name, point.x + 2, point.y - 2);
		if (zoom < 9) {
			ctx.fillRect(point.x - 1, point.y - 1, 2, 2);
		}
	}
}

function setVisibleStates() {
	visibleStates = [];	// TODO Not globally defined
	for (var stateAbbreviation in state_details) {
		var state = state_details[stateAbbreviation];
		if (isRectangleIntersect(bounds.wgs84, state)) {
			visibleStates.push(stateAbbreviation);
		}
	}
}

function prepPriSec() {
	var coords;
	//var start = new Date().getTime();
	/*states_prisec.forEach(function(state) {
		state.ifeat = [];
		state.ufeat = [];
		state.sfeat = [];
		state.mfeat = [];
		state.cfeat = [];
		state.maxLon = state.features[0].geometry.coordinates[0][0];
		state.minLon = state.features[0].geometry.coordinates[0][0];
		state.maxLat = state.features[0].geometry.coordinates[0][1];
		state.minLat = state.features[0].geometry.coordinates[0][1];
		for (var i = 0, len = state.features.length; i < len; i++) {
			// Sort by feature
			switch (state.features[i].properties.RTTYP) {
				case 'I':
					state.ifeat.push(state.features[i]);
					break;
				case 'U':
					state.ufeat.push(state.features[i]);
					break;
				case 'S':
					state.sfeat.push(state.features[i]);
					break;
				case 'M':
					state.mfeat.push(state.features[i]);
					break;
				case 'C':
					state.cfeat.push(state.features[i]);
					break;
			}
			
			// Find max/min lat/lon
			for (var j = 1, jlen = state.features[i].geometry.coordinates.length; j < jlen; j++) {
				coords = state.features[i].geometry.coordinates[j];
				if (coords[0] < state.maxLon) {
					state.maxLon = coords[0];
				} else if (coords[0] > state.minLon) {
					state.minLon = coords[0];
				}
				if (coords[1] > state.maxLat) {
					state.maxLat = coords[1];
				} else if (coords[1] < state.minLat) {
					state.minLat = coords[1];
				}
			}
		}
	});
	//console.log((new Date().getTime() - start) + 'ms');*/
}

function hoverPriSec(x0, y0) {
	// Need same logic as renderPriSec
	if (zoom < 6) { return; }

	//var start = new Date().getTime();
	var tolerance = 4;
	var allowedTypes = ['I', 'U', 'S', 'M', 'C'];
	switch (zoom) {
		case 6:
			allowedTypes = ['I'];
			break;
		case 7:
			allowedTypes = ['I'];
			break;
		case 8:
			allowedTypes = ['I', 'U'];
			break;
		case 9:
			allowedTypes = ['I', 'U'];
			break;
		case 10:
			allowedTypes = ['I', 'U', 'S'];
			break;
	}

	var feature, c1, c2, x1, y1, x2, y2;
	var looking = true;
	/*states_prisec.forEach(function(state) {
		if (looking && visibleStates.indexOf(state.name) > -1) {
			for (var i = 0, len = state.features.length; i < len; i++) {
				if (!looking) { break; }
				feature = state.features[i];
				if (allowedTypes.indexOf(feature.properties.RTTYP) === -1) { continue; }

				for (var j = 0, jlen = feature.geometry.coordinates.length - 1; j < jlen; j++) {
					c1 = wgsToScreen(feature.geometry.coordinates[j][0], feature.geometry.coordinates[j][1]);
					c2 = wgsToScreen(feature.geometry.coordinates[j + 1][0], feature.geometry.coordinates[j + 1][1]);
					x1 = c1.x;
					y1 = c1.y;
					x2 = c2.x;
					y2 = c2.y;
					switch ((y2 - y1) / (x2 - x1)) {
						case 1/0:
							if (x0 < x1 + tolerance &&
								x0 > x1 - tolerance &&
								y0 > Math.min(y1, y2) - tolerance &&
								y0 < Math.max(y1, y2) + tolerance) {
									looking = false;
							}
							break;
						case 0:
							if (x0 > Math.min(x1, x2) - tolerance &&
								x0 < Math.max(x1, x2) + tolerance &&
								y0 > y1 - tolerance &&
								y0 < y1 + tolerance) {
									looking = false;
							}
							break;
						default:
							if (x0 > Math.min(x1, x2) - tolerance &&
								x0 < Math.max(x1, x2) + tolerance &&
								y0 > Math.min(y1, y2) - tolerance &&
								y0 < Math.max(y1, y2) + tolerance) {
									if (Math.abs((y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - y2 * x1) /
										Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2)) < tolerance) {
										looking = false;
									}
							}
							break;
					}

					if (!looking) {
						infoFeature.innerText = feature.properties.FULLNAME;
						break;
					}
					infoFeature.innerText = '';
				}
			}
		}
	});*/

	//console.log('hoverPriSec time: ' + ((new Date()).getTime() - start) + 'ms');
}

function renderCountyRoads(shp) {
	// TODO zoom and visible state logic

	var startCoords, nextCoords, inBounds, f, i, j, coords;
	for (i = 0, len = shp.features.length; i < len; i++) {
		f = shp.features[i];
		inBounds = false;
		for (j = 0, jlen = f.geometry.coordinates.length; j < jlen; j++) {
			coords = f.geometry.coordinates[j];
			if (coords[0] > bounds.lon1 && coords[0] < bounds.lon2 && coords[1] < bounds.lat1 && coords[1] > bounds.lat2) {
				inBounds = true;
				break;
			}
		}

		if (!inBounds) { continue; }
		startCoords = wgsToScreen(f.geometry.coordinates[0][0], f.geometry.coordinates[0][1]);
		ctx.moveTo(startCoords.x + 0.5, startCoords.y + 0.5);
		for (j = 1, jlen = f.geometry.coordinates.length; j < jlen; j++) {
			nextCoords = wgsToScreen(f.geometry.coordinates[j][0], f.geometry.coordinates[j][1]);
			ctx.lineTo(nextCoords.x + 0.5, nextCoords.y + 0.5);
			debuglines++;
		}
	}

	ctx.strokeStyle = '#FFA500';
	ctx.lineWidth = 1;
	ctx.stroke();
	ctx.beginPath();
}

function renderPriSec(state) {
	// Display logic
	if (zoom < 6) { return; }
	if (visibleStates.indexOf(state) === -1) { return; }

	var sdata = data.states[state];
	var startCoords, nextCoords, inBounds, coords, i, j;
	var roadsToRender = [];
	// Reverse push order to layer correctly
	//if (zoom >= 10) { roadsToRender.push(sdata.roads.prisec.s); }
	if (zoom >= 8) { roadsToRender.push(sdata.roads.prisec.u); }
	roadsToRender.push(sdata.roads.prisec.i);
	roadsToRender.forEach(function(rtr) {
		for (i = 0, len = rtr.length; i < len; i++) {
			inBounds = false;
			for (j = 0, jlen = rtr[i].geometry.coordinates.length; j < jlen; j++) {
				coords = rtr[i].geometry.coordinates[j];
				if (coords[0] > bounds.lon1 && coords[0] < bounds.lon2 && coords[1] < bounds.lat1 && coords[1] > bounds.lat2) {
					inBounds = true;
					break;
				}
			}

			if (!inBounds) { continue; }

			startCoords = wgsToScreen(rtr[i].geometry.coordinates[0][0], rtr[i].geometry.coordinates[0][1]);
			ctx.moveTo(startCoords.x + 0.5, startCoords.y + 0.5);
			for (j = 1, jlen = rtr[i].geometry.coordinates.length; j < jlen; j++) {
				nextCoords = wgsToScreen(rtr[i].geometry.coordinates[j][0], rtr[i].geometry.coordinates[j][1]);
				ctx.lineTo(nextCoords.x + 0.5, nextCoords.y + 0.5);
				debuglines++;
			}
		}

		switch (rtr[0].properties.RTTYP) {
			case 'I':
				ctx.strokeStyle = '#B8860B';
				break;
			case 'U':
				ctx.strokeStyle = '#EEE8AA';
				break;
			case 'S':
				ctx.strokeStyle = '#DDD';
				break;
		}
		ctx.lineWidth = 1;
		ctx.stroke();
		ctx.beginPath();
	});
}

function renderWsrSites(shp) {
	if (!showWsrSites) { return; }

	var options = { 'size': 4, 'textSize': 12 };
	// TODO cheaper to just render twice, rather than mess with shadows?
	ctx.shadowColor = '#000';
	ctx.shadowOffsetX = 2;
	ctx.shadowOffsetY = 2;
	ctx.shadowBlur = 4;
	for (var i = 0, len = shp.length; i < len; i++) {
		if (shp[i].Latitude < bounds.lat1 && shp[i].Latitude > bounds.lat2 && shp[i].Longitude > bounds.lon1 && shp[i].Longitude < bounds.lon2) { 
			options.label = shp[i].Name;
			drawPoint(shp[i].Longitude, shp[i].Latitude, options);
		}
	}
	ctx.beginPath();
}

function renderStates(options) {
	var f, l, coords, startCoords, nextCoords;
	options = options || {};
	var start = new Date().getTime();
	//var inBounds = false;
	var inBounds = true;
	var featureRenderCount = 0;
	var shp = states;
	for (var i = 0, len = shp.features.length; i < len; i++) {
		f = shp.features[i];
		for (var j = 0; j < f.geometry.coordinates.length; j++) {
			for (var k = 0; k < f.geometry.coordinates[j].length; k++) {
				//inBounds = false;
				for (l = 0; l < f.geometry.coordinates[j][k].length; l++) {
					coords = f.geometry.coordinates[j][k][l];
					/*if (coords[0] > bounds.lon1 && coords[0] < bounds.lon2 && coords[1] < bounds.lat1 && coords[1] > bounds.lat2) {
						inBounds = true;
						break;
					}*/
				}

				if (!inBounds) { continue; }
				startCoords = wgsToScreen(f.geometry.coordinates[j][k][0][0], f.geometry.coordinates[j][k][0][1]);
				ctx.moveTo(startCoords.x, startCoords.y);
				for (l = 1; l < f.geometry.coordinates[j][k].length; l++) {
					nextCoords = wgsToScreen(f.geometry.coordinates[j][k][l][0], f.geometry.coordinates[j][k][l][1]);
					ctx.lineTo(nextCoords.x, nextCoords.y);
				}
			}
		}
	}

	if (zoom > 7) {
		ctx.fillStyle = '#F3F1ED';
		ctx.fill();
		ctx.strokeStyle = '#ccc';
	} else {
		ctx.strokeStyle = '#666';
	}

	ctx.lineWidth = 1;
	ctx.setLineDash([5]);
	ctx.stroke();
	ctx.setLineDash([]);
	ctx.beginPath();
}

function renderShapefile(shp, options) {
	var tmpBounds = {}, tmpDrawLine;

	if (!shp && !shp.features) { return; }

	options = options || {};
	tmpBounds = shp.wmPreComputed ? bounds.wm : bounds.wgs84;
	tmpDrawLine = shp.wmPreComputed ? drawLineWm : drawLine;

	for (i = 0, len = shp.features.length; i < len; i++) {
		f = shp.features[i];
		if (!f.geometry || !f.geometry.coordinates) { continue; }
		if (options.filterFeature && options.filterFeature(f)) { continue; }
		switch (f.geometry.type) {
			case 'LineString':
				for (j = 0, jlen = f.geometry.coordinates.length - 1; j < jlen; j++) {
					if (f.geometry.coordinates[j][0] > tmpBounds.left && f.geometry.coordinates[j][0] < tmpBounds.right && f.geometry.coordinates[j][1] < tmpBounds.top && f.geometry.coordinates[j][1] > tmpBounds.bottom) {
						tmpDrawLine(
							f.geometry.coordinates[j][0],
							f.geometry.coordinates[j + 1][0],
							f.geometry.coordinates[j][1],
							f.geometry.coordinates[j + 1][1]
						);
					}
				}
				break;
			case 'MultiLineString':
				for (j = 0, jlen = f.geometry.coordinates.length; j < jlen; j++) {
					for (k = 0, klen = f.geometry.coordinates[j].length - 1; k < klen; k++) {
						if (f.geometry.coordinates[j][k][0] > bounds.lon1 &&
							f.geometry.coordinates[j][k][0] < bounds.lon2 &&
							f.geometry.coordinates[j][k][1] < bounds.lat1 &&
							f.geometry.coordinates[j][k][1] > bounds.lat2) {
							drawLine(
								f.geometry.coordinates[j][k][0],
								f.geometry.coordinates[j][k + 1][0],
								f.geometry.coordinates[j][k][1],
								f.geometry.coordinates[j][k + 1][1]
							);
						}
					}
				}
				break;
			case 'MultiPolygon':
				f.geometry.coordinates.forEach(function(c) {
					c.forEach(function(d) {
						for (j = 0; j < d.length; j++) {
							if (j < d.length - 1) {
								if (d[j][0] > bounds.lon1 && d[j][0] < bounds.lon2 && d[j][1] < bounds.lat1 && d[j][1] > bounds.lat2) {
									drawLine(
										d[j][0],
										d[j + 1][0],
										d[j][1],
										d[j + 1][1]
									);
								}
							}
						}
					});
				});
				break;
		}
	}

	ctx.strokeStyle = options.strokeStyle || '#FFA500';
	ctx.stroke();
	ctx.beginPath();
}