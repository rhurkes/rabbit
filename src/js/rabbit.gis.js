/* Perf testing notes:
	1. reducing functions gives the best bang for the buck, a few ms
	2. removing math.floor actually slows it down by .4ms
	3. none of the math optimizations seem to help much
	4. pre-computing display.offsetHeight - offset.y shaves a few ms off
*/

// GLOBAL LOOPING VARIABLES
var a, x, y;

// From WGS to Screen
function wgsToWm (lon, lat) {
    x = lon * 6378137 * 0.017453292519943295;
    a = lat * 0.017453292519943295;
    y = 3189068.5 * Math.log((1 + Math.sin(a)) / (1 - Math.sin(a)));
    return { 'x': x, 'y': y };
}
function wmToWxy (x, y, mpp) {
	mpp = mpp || metersPerPixel;	// Allow zoom level to be passed in
	return { 'x': Math.floor(x / mpp), 'y': Math.floor(y / mpp) };
}
function wxyToScreen(x, y) {
	return { 'x': x + offset.x, 'y': (map.offsetHeight - offset.y) - y };
}
function wgsToScreen(lon, lat) {
    a = Math.sin(lat * 0.017453292519943295);
    y = 3189068 * Math.log((1 + a) / (1 - a));
	return { 'x': Math.floor(lon * 111319 / metersPerPixel) + offset.x, 'y': syo - Math.floor(y / metersPerPixel) };
}
function wmToScreen(x, y) {
	return {
		'x': Math.floor(x / metersPerPixel) + offset.x,
		'y': syo - Math.floor(y / metersPerPixel)
	};
}
function wgsToShadowCanvas(lon, lat) {
	var wm = wgsToWm(lon, lat);
	var wxy = wmToWxy(wm.x, wm.y);
	var loupeOffset = findXyOffset(center);
	x = wm.x + loupeOffset.x;
	y = (loupeSize - loupeOffset.y) - wm.y;
	return { 'x': x, 'y': y };
}

// From Screen to WGS
function screenToWxy(x, y) {
	return { 'x': x - offset.x, 'y': (map.offsetHeight - offset.y) - y };
}
function wxyToWm (x, y, mpp) {
	mpp = mpp || metersPerPixel;	// Allow zoom level to be passed in
	return { x: Math.floor(x * mpp), y: Math.floor(y * mpp) };
}
function wmToWgs(x, y) {
    var n1 = (x / 6378137) * 57.295779513082323;
    var n2 = Math.floor((n1 + 180) / 360);
    var n3 = (1.5707963267948966 - (2 * Math.atan(Math.exp((-1 * y) / 6378137))));
    var lat = n3 * 57.295779513082323;
    return { 'lon': n1 - (n2 * 360), 'lat': lat };
}
function screenToWgs(x, y) {
	var wxy = screenToWxy(x, y);
	var wm = wxyToWm(wxy.x, wxy.y);
	return wmToWgs(wm.x, wm.y);
}

// FIPS STATE CODE MAPPING
// Note: the index of the array is the fips code
var fipsStateMap = [{ name: '', abbreviation: '' },
{ name: 'Alabama', abbreviation: 'AL' },
{ name: 'Alaska', abbreviation: 'AK' },
{ name: 'American Samoa', abbreviation: '' },
{ name: 'Arizona', abbreviation: 'AZ' },
{ name: 'Arkansas', abbreviation: 'AR' },
{ name: 'California', abbreviation: 'CA' },
{ name: 'Canal Zone', abbreviation: '' },
{ name: 'Colorado', abbreviation: 'CO' },
{ name: 'Connecticut', abbreviation: 'CT' },
{ name: 'Delaware', abbreviation: 'DE' },
{ name: 'District of Columbia', abbreviation: 'DC' },
{ name: 'Florida', abbreviation: 'FL' },
{ name: 'Georgia', abbreviation: 'GA' },
{ name: 'Guam', abbreviation: '' },
{ name: 'Hawaii', abbreviation: 'HI' },
{ name: 'Idaho', abbreviation: 'ID' },
{ name: 'Illinois', abbreviation: 'IL' },
{ name: 'Indiana', abbreviation: 'IN' },
{ name: 'Iowa', abbreviation: 'IA' },
{ name: 'Kansas', abbreviation: 'KS' },
{ name: 'Kentucky', abbreviation: 'KY' },
{ name: 'Louisiana', abbreviation: 'LA' },
{ name: 'Maine', abbreviation: 'ME' },
{ name: 'Maryland', abbreviation: 'MD' },
{ name: 'Massachusetts', abbreviation: 'MA' },
{ name: 'Michigan', abbreviation: 'MI' },
{ name: 'Minnesota', abbreviation: 'MN' },
{ name: 'Mississippi', abbreviation: 'MS' },
{ name: 'Missouri', abbreviation: 'MO' },
{ name: 'Montana', abbreviation: 'MT' },
{ name: 'Nebraska', abbreviation: 'NE' },
{ name: 'Nevada', abbreviation: 'NV' },
{ name: 'New Hampshire', abbreviation: 'NH' },
{ name: 'New Jersey', abbreviation: 'NJ' },
{ name: 'New Mexico', abbreviation: 'NM' },
{ name: 'New York', abbreviation: 'NY' },
{ name: 'North Carolina', abbreviation: 'NC' },
{ name: 'North Dakota', abbreviation: 'ND' },
{ name: 'Ohio', abbreviation: 'OH' },
{ name: 'Oklahoma', abbreviation: 'OK' },
{ name: 'Oregon', abbreviation: 'OR' },
{ name: 'Pennsylvania', abbreviation: 'PA' },
{ name: 'Puerto Rico', abbreviation: '' },
{ name: 'Rhode Island', abbreviation: 'RI' },
{ name: 'South Carolina', abbreviation: 'SC' },
{ name: 'South Dakota', abbreviation: 'SD' },
{ name: 'Tennessee', abbreviation: 'TN' },
{ name: 'Texas', abbreviation: 'TX' },
{ name: 'Utah', abbreviation: 'UT' },
{ name: 'Vermont', abbreviation: 'VT' },
{ name: 'Virginia', abbreviation: 'VA' },
{ name: 'Virgin Islands of the U.S.', abbreviation: '' },
{ name: 'Washington', abbreviation: 'WA' },
{ name: 'West Virginia', abbreviation: 'WV' },
{ name: 'Wisconsin', abbreviation: 'WI' },
{ name: 'Wyoming', abbreviation: 'WY' }];

var state_details = {
    "CA": {
        "fips": 6,
        "top": 42.009247,
        "bottom": 32.534156,
        "right": -114.139055,
        "left": -124.409591
    },
    "DC": {
        "fips": 11,
        "top": 38.995548,
        "bottom": 38.791645,
        "right": -76.909393,
        "left": -77.119759
    },
    "FL": {
        "fips": 12,
        "top": 31.000693,
        "bottom": 24.498131,
        "right": -80.03212,
        "left": -87.634943
    },
    "GA": {
        "fips": 13,
        "top": 35.000659,
        "bottom": 30.360766,
        "right": -80.84313,
        "left": -85.605165
    },
    "ID": {
        "fips": 16,
        "top": 49.000912,
        "bottom": 41.98858,
        "right": -111.043564,
        "left": -117.243027
    },
    "IL": {
        "fips": 17,
        "top": 42.508481,
        "bottom": 36.982057,
        "right": -87.498948,
        "left": -91.511956
    },
    "IA": {
        "fips": 19,
        "top": 43.500885,
        "bottom": 40.378264,
        "right": -90.140613,
        "left": -96.624704
    },
    "KY": {
        "fips": 21,
        "top": 39.147358,
        "bottom": 36.497934,
        "right": -81.968297,
        "left": -89.571481
    },
    "LA": {
        "fips": 22,
        "top": 33.019457,
        "bottom": 28.933812,
        "right": -89.01428,
        "left": -94.043083
    },
    "MD": {
        "fips": 24,
        "top": 39.723122,
        "bottom": 37.916848,
        "right": -75.048939,
        "left": -79.486873
    },
    "MI": {
        "fips": 26,
        "top": 48.21065,
        "bottom": 41.696089,
        "right": -82.415937,
        "left": -90.418136
    },
    "MN": {
        "fips": 27,
        "top": 49.384358,
        "bottom": 43.49952,
        "right": -89.489226,
        "left": -97.229039
    },
    "MO": {
        "fips": 29,
        "top": 40.61364,
        "bottom": 35.995812,
        "right": -89.098843,
        "left": -95.765645
    },
    "NY": {
        "fips": 36,
        "top": 45.014683,
        "bottom": 40.502436,
        "right": -71.856214,
        "left": -79.762122
    },
    "OR": {
        "fips": 41,
        "top": 46.269131,
        "bottom": 41.992692,
        "right": -116.463504,
        "left": -124.552441
    },
    "TN": {
        "fips": 47,
        "top": 36.678118,
        "bottom": 34.982987,
        "right": -81.6469,
        "left": -90.309297
    },
    "TX": {
        "fips": 48,
        "top": 36.500439,
        "bottom": 25.840117,
        "right": -93.530936,
        "left": -106.63588
    },
    "VA": {
        "fips": 51,
        "top": 39.466012,
        "bottom": 36.540738,
        "right": -75.242266,
        "left": -83.675413
    },
    "WI": {
        "fips": 55,
        "top": 47.054678,
        "bottom": 42.49192,
        "right": -86.805868,
        "left": -92.887929
    },
    "AZ": {
        "fips": 4,
        "top": 37.003197,
        "bottom": 31.332239,
        "right": -109.045223,
        "left": -114.814185
    },
    "AR": {
        "fips": 5,
        "top": 36.4996,
        "bottom": 33.004106,
        "right": -89.64727,
        "left": -94.617919
    },
    "CO": {
        "fips": 8,
        "top": 41.003073,
        "bottom": 36.992426,
        "right": -102.041876,
        "left": -109.060062
    },
    "IN": {
        "fips": 18,
        "top": 41.76024,
        "bottom": 37.767631,
        "right": -84.786406,
        "left": -88.067364
    },
    "CT": {
        "fips": 9,
        "top": 42.049638,
        "bottom": 40.985171,
        "right": -71.789356,
        "left": -73.727775
    },
    "NE": {
        "fips": 31,
        "top": 43.000768,
        "bottom": 39.999998,
        "right": -95.30829,
        "left": -104.053249
    },
    "NM": {
        "fips": 35,
        "top": 37.000139,
        "bottom": 31.332315,
        "right": -103.001964,
        "left": -109.050044
    },
    "NC": {
        "fips": 37,
        "top": 36.588117,
        "bottom": 33.851112,
        "right": -75.458659,
        "left": -84.321869
    },
    "OH": {
        "fips": 39,
        "top": 41.977523,
        "bottom": 38.404338,
        "right": -80.518893,
        "left": -84.820159
    },
    "ME": {
        "fips": 23,
        "top": 47.457159,
        "bottom": 43.059825,
        "right": -66.949895,
        "left": -71.083924
    },
    "MA": {
        "fips": 25,
        "top": 42.884589,
        "bottom": 41.237964,
        "right": -69.928261,
        "left": -73.508142
    },
    "MS": {
        "fips": 28,
        "top": 34.996033,
        "bottom": 30.180753,
        "right": -88.097888,
        "left": -91.644356
    },
    "MT": {
        "fips": 30,
        "top": 49.00139,
        "bottom": 44.380315,
        "right": -104.039138,
        "left": -116.049193
    },
    "OK": {
        "fips": 40,
        "top": 37.001631,
        "bottom": 33.62184,
        "right": -94.431515,
        "left": -103.002518
    },
    "SC": {
        "fips": 45,
        "top": 35.202483,
        "bottom": 32.0346,
        "right": -78.541087,
        "left": -83.353238
    },
    "SD": {
        "fips": 46,
        "top": 45.94531,
        "bottom": 42.482749,
        "right": -96.439335,
        "left": -104.057698
    },
    "UT": {
        "fips": 49,
        "top": 42.001567,
        "bottom": 36.997968,
        "right": -109.041762,
        "left": -114.052701
    },
    "WA": {
        "fips": 53,
        "top": 49.002494,
        "bottom": 45.544321,
        "right": -116.915989,
        "left": -124.725839
    },
    "WV": {
        "fips": 54,
        "top": 40.638801,
        "bottom": 37.202467,
        "right": -77.719519,
        "left": -82.626182
    },
    "WY": {
        "fips": 56,
        "top": 45.005904,
        "bottom": 40.996346,
        "right": -104.052287,
        "left": -111.056888
    },
    "DE": {
        "fips": 10,
        "top": 39.839185,
        "bottom": 38.451012,
        "right": -75.048939,
        "left": -75.788596
    },
    "RI": {
        "fips": 44,
        "top": 42.018798,
        "bottom": 41.146339,
        "right": -71.12057,
        "left": -71.862772
    },
    "AL": {
        "fips": 1,
        "top": 35.008028,
        "bottom": 30.228314,
        "right": -84.891841,
        "left": -88.468669
    },
    "ND": {
        "fips": 38,
        "top": 49.000687,
        "bottom": 45.935245,
        "right": -96.554507,
        "left": -104.0489
    },
    "PA": {
        "fips": 42,
        "top": 42.26986,
        "bottom": 39.720062,
        "right": -74.694914,
        "left": -80.519891
    },
    "VT": {
        "fips": 50,
        "top": 45.01479,
        "bottom": 42.726853,
        "right": -71.494403,
        "left": -73.43688
    },
    "KS": {
        "fips": 20,
        "top": 40.003078,
        "bottom": 36.993083,
        "right": -94.591933,
        "left": -102.051744
    },
    "NV": {
        "fips": 32,
        "top": 42.00038,
        "bottom": 35.001857,
        "right": -114.039901,
        "left": -120.005142
    },
    "NH": {
        "fips": 33,
        "top": 45.305451,
        "bottom": 42.69699,
        "right": -70.703818,
        "left": -72.556112
    },
    "NJ": {
        "fips": 34,
        "top": 41.357423,
        "bottom": 38.928519,
        "right": -73.893979,
        "left": -75.559446
    }
}