import json
import operator

with open('us_cities.geojson') as oldfile:
	data = json.load(oldfile)
	newdata = []
	for feature in data['features']:
		tmpFeature = {}
		tmpFeature['fips'] = feature['properties']['ST_FIPS']
		if not tmpFeature['fips'] is None:
			tmpFeature['fips'] = int(tmpFeature['fips'])
		tmpFeature['name'] = feature['properties']['NAME']
		tmpFeature['elev'] = feature['properties']['ELEVATION']
		tmpFeature['pop'] = feature['properties']['POPULATION']
		if tmpFeature['pop'] == '<Null>' or tmpFeature['pop'] is None:
			tmpFeature['pop'] = '0'
		tmpFeature['pop'] = tmpFeature['pop'].replace('.0000', '')
		tmpFeature['pop'] = int(tmpFeature['pop'])	
		tmpFeature['lat'] = feature['geometry']['coordinates'][1]
		tmpFeature['lon'] = feature['geometry']['coordinates'][0]
		if (tmpFeature['lat'] > 23 and tmpFeature['lon'] < 60 and tmpFeature['lat'] < 52 and tmpFeature['lon'] > -127
			and not tmpFeature['fips'] is None):
			newdata.append(tmpFeature)
	newdata = sorted(newdata, key=operator.itemgetter('pop'), reverse=True)
	newdata = sorted(newdata, key=operator.itemgetter('fips'))

with open('us_cities.json', 'w') as newfile:
	json.dump(newdata, newfile)
