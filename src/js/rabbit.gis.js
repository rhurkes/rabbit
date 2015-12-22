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
        "maxLat": 42.009247,
        "minLat": 32.534156,
        "maxLon": -114.139055,
        "minLon": -124.409591
    },
    "DC": {
        "fips": 11,
        "maxLat": 38.995548,
        "minLat": 38.791645,
        "maxLon": -76.909393,
        "minLon": -77.119759
    },
    "FL": {
        "fips": 12,
        "maxLat": 31.000693,
        "minLat": 24.498131,
        "maxLon": -80.03212,
        "minLon": -87.634943
    },
    "GA": {
        "fips": 13,
        "maxLat": 35.000659,
        "minLat": 30.360766,
        "maxLon": -80.84313,
        "minLon": -85.605165
    },
    "ID": {
        "fips": 16,
        "maxLat": 49.000912,
        "minLat": 41.98858,
        "maxLon": -111.043564,
        "minLon": -117.243027
    },
    "IL": {
        "fips": 17,
        "maxLat": 42.508481,
        "minLat": 36.982057,
        "maxLon": -87.498948,
        "minLon": -91.511956
    },
    "IA": {
        "fips": 19,
        "maxLat": 43.500885,
        "minLat": 40.378264,
        "maxLon": -90.140613,
        "minLon": -96.624704
    },
    "KY": {
        "fips": 21,
        "maxLat": 39.147358,
        "minLat": 36.497934,
        "maxLon": -81.968297,
        "minLon": -89.571481
    },
    "LA": {
        "fips": 22,
        "maxLat": 33.019457,
        "minLat": 28.933812,
        "maxLon": -89.01428,
        "minLon": -94.043083
    },
    "MD": {
        "fips": 24,
        "maxLat": 39.723122,
        "minLat": 37.916848,
        "maxLon": -75.048939,
        "minLon": -79.486873
    },
    "MI": {
        "fips": 26,
        "maxLat": 48.21065,
        "minLat": 41.696089,
        "maxLon": -82.415937,
        "minLon": -90.418136
    },
    "MN": {
        "fips": 27,
        "maxLat": 49.384358,
        "minLat": 43.49952,
        "maxLon": -89.489226,
        "minLon": -97.229039
    },
    "MO": {
        "fips": 29,
        "maxLat": 40.61364,
        "minLat": 35.995812,
        "maxLon": -89.098843,
        "minLon": -95.765645
    },
    "NY": {
        "fips": 36,
        "maxLat": 45.014683,
        "minLat": 40.502436,
        "maxLon": -71.856214,
        "minLon": -79.762122
    },
    "OR": {
        "fips": 41,
        "maxLat": 46.269131,
        "minLat": 41.992692,
        "maxLon": -116.463504,
        "minLon": -124.552441
    },
    "TN": {
        "fips": 47,
        "maxLat": 36.678118,
        "minLat": 34.982987,
        "maxLon": -81.6469,
        "minLon": -90.309297
    },
    "TX": {
        "fips": 48,
        "maxLat": 36.500439,
        "minLat": 25.840117,
        "maxLon": -93.530936,
        "minLon": -106.63588
    },
    "VA": {
        "fips": 51,
        "maxLat": 39.466012,
        "minLat": 36.540738,
        "maxLon": -75.242266,
        "minLon": -83.675413
    },
    "WI": {
        "fips": 55,
        "maxLat": 47.054678,
        "minLat": 42.49192,
        "maxLon": -86.805868,
        "minLon": -92.887929
    },
    "AZ": {
        "fips": 4,
        "maxLat": 37.003197,
        "minLat": 31.332239,
        "maxLon": -109.045223,
        "minLon": -114.814185
    },
    "AR": {
        "fips": 5,
        "maxLat": 36.4996,
        "minLat": 33.004106,
        "maxLon": -89.64727,
        "minLon": -94.617919
    },
    "CO": {
        "fips": 8,
        "maxLat": 41.003073,
        "minLat": 36.992426,
        "maxLon": -102.041876,
        "minLon": -109.060062
    },
    "IN": {
        "fips": 18,
        "maxLat": 41.76024,
        "minLat": 37.767631,
        "maxLon": -84.786406,
        "minLon": -88.067364
    },
    "CT": {
        "fips": 9,
        "maxLat": 42.049638,
        "minLat": 40.985171,
        "maxLon": -71.789356,
        "minLon": -73.727775
    },
    "NE": {
        "fips": 31,
        "maxLat": 43.000768,
        "minLat": 39.999998,
        "maxLon": -95.30829,
        "minLon": -104.053249
    },
    "NM": {
        "fips": 35,
        "maxLat": 37.000139,
        "minLat": 31.332315,
        "maxLon": -103.001964,
        "minLon": -109.050044
    },
    "NC": {
        "fips": 37,
        "maxLat": 36.588117,
        "minLat": 33.851112,
        "maxLon": -75.458659,
        "minLon": -84.321869
    },
    "OH": {
        "fips": 39,
        "maxLat": 41.977523,
        "minLat": 38.404338,
        "maxLon": -80.518893,
        "minLon": -84.820159
    },
    "ME": {
        "fips": 23,
        "maxLat": 47.457159,
        "minLat": 43.059825,
        "maxLon": -66.949895,
        "minLon": -71.083924
    },
    "MA": {
        "fips": 25,
        "maxLat": 42.884589,
        "minLat": 41.237964,
        "maxLon": -69.928261,
        "minLon": -73.508142
    },
    "MS": {
        "fips": 28,
        "maxLat": 34.996033,
        "minLat": 30.180753,
        "maxLon": -88.097888,
        "minLon": -91.644356
    },
    "MT": {
        "fips": 30,
        "maxLat": 49.00139,
        "minLat": 44.380315,
        "maxLon": -104.039138,
        "minLon": -116.049193
    },
    "OK": {
        "fips": 40,
        "maxLat": 37.001631,
        "minLat": 33.62184,
        "maxLon": -94.431515,
        "minLon": -103.002518
    },
    "SC": {
        "fips": 45,
        "maxLat": 35.202483,
        "minLat": 32.0346,
        "maxLon": -78.541087,
        "minLon": -83.353238
    },
    "SD": {
        "fips": 46,
        "maxLat": 45.94531,
        "minLat": 42.482749,
        "maxLon": -96.439335,
        "minLon": -104.057698
    },
    "UT": {
        "fips": 49,
        "maxLat": 42.001567,
        "minLat": 36.997968,
        "maxLon": -109.041762,
        "minLon": -114.052701
    },
    "WA": {
        "fips": 53,
        "maxLat": 49.002494,
        "minLat": 45.544321,
        "maxLon": -116.915989,
        "minLon": -124.725839
    },
    "WV": {
        "fips": 54,
        "maxLat": 40.638801,
        "minLat": 37.202467,
        "maxLon": -77.719519,
        "minLon": -82.626182
    },
    "WY": {
        "fips": 56,
        "maxLat": 45.005904,
        "minLat": 40.996346,
        "maxLon": -104.052287,
        "minLon": -111.056888
    },
    "DE": {
        "fips": 10,
        "maxLat": 39.839185,
        "minLat": 38.451012,
        "maxLon": -75.048939,
        "minLon": -75.788596
    },
    "RI": {
        "fips": 44,
        "maxLat": 42.018798,
        "minLat": 41.146339,
        "maxLon": -71.12057,
        "minLon": -71.862772
    },
    "AL": {
        "fips": 1,
        "maxLat": 35.008028,
        "minLat": 30.228314,
        "maxLon": -84.891841,
        "minLon": -88.468669
    },
    "ND": {
        "fips": 38,
        "maxLat": 49.000687,
        "minLat": 45.935245,
        "maxLon": -96.554507,
        "minLon": -104.0489
    },
    "PA": {
        "fips": 42,
        "maxLat": 42.26986,
        "minLat": 39.720062,
        "maxLon": -74.694914,
        "minLon": -80.519891
    },
    "VT": {
        "fips": 50,
        "maxLat": 45.01479,
        "minLat": 42.726853,
        "maxLon": -71.494403,
        "minLon": -73.43688
    },
    "KS": {
        "fips": 20,
        "maxLat": 40.003078,
        "minLat": 36.993083,
        "maxLon": -94.591933,
        "minLon": -102.051744
    },
    "NV": {
        "fips": 32,
        "maxLat": 42.00038,
        "minLat": 35.001857,
        "maxLon": -114.039901,
        "minLon": -120.005142
    },
    "NH": {
        "fips": 33,
        "maxLat": 45.305451,
        "minLat": 42.69699,
        "maxLon": -70.703818,
        "minLon": -72.556112
    },
    "NJ": {
        "fips": 34,
        "maxLat": 41.357423,
        "minLat": 38.928519,
        "maxLon": -73.893979,
        "minLon": -75.559446
    }
}