states.features.forEach(function(state) {
	state_details[state.properties.STUSPS] = {};
	var details = state_details[state.properties.STUSPS];
	details.fips = parseInt(state.properties.STATEFP);
	state.geometry.coordinates.forEach(function(firstArray) {
		firstArray.forEach(function(secondArray) {
			secondArray.forEach(function(thirdArray) {
				if (details.maxLat === undefined || details.maxLat < thirdArray[1]) {
					details.maxLat = thirdArray[1];
				}
				if (details.minLat === undefined || details.minLat > thirdArray[1]) {
					details.minLat = thirdArray[1];
				}
				if (details.maxLon === undefined || details.maxLon < thirdArray[0]) {
					details.maxLon = thirdArray[0];
				}
				if (details.minLon === undefined || details.minLon > thirdArray[0]) {
					details.minLon = thirdArray[0];
				}
			});
		});
	});
});