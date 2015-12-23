import json
from pprint import pprint

with open('cities.geojson') as old:
	data = json.load(old)
	citiesData = {}
	for f in data['features']:
		state = f['properties']['STATE']
		if not state in citiesData:
			citiesData[state] = []
		entry = {'name': f['properties']['NAME'], 'rank': f['properties']['FEATURE2'], 'elev': f['properties']['ELEV_IN_M'], 'pop': f['properties']['POP_2010'], 'lat': f['geometry']['coordinates'][1], 'lon': f['geometry']['coordinates'][0] }
		if entry['rank'] == '-999':
			entry['rank'] = 0
		elif entry['rank'] == 'County Seat':
			entry['rank'] = 1
		elif entry['rank'] == 'National Capital':
			entry['rank'] = 3
		else:
			entry['rank'] = 2

		if entry['pop'] == -999:
			entry['pop'] = 0
		citiesData[state].append(entry)

with open('cities.json', 'w') as new:
	json.dump(citiesData, new)
