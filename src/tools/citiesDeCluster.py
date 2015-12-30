import json
import operator

with open('../data/gis/cities.json') as old:
	text = old.read()
	text = text.replace('var cities = ', '').rstrip(';')
	data = json.loads(text)
	for stateAbbreviation in data:
		data[stateAbbreviation] = sorted(data[stateAbbreviation], key=operator.itemgetter('pop'), reverse=True)
		data[stateAbbreviation] = sorted(data[stateAbbreviation], key=operator.itemgetter('rank'), reverse=True)
		data[stateAbbreviation] = sorted(data[stateAbbreviation], key=operator.itemgetter('zoom'))			

		displayed = 0
		for city in data['CA']:
			if city['zoom'] == 8:
				if displayed < 6 and city['lon'] > -118.6 and city['lon'] < -116.8 and city['lat'] > 33.3 and city['lat'] < 34.3:
					displayed += 1
				else:
					print city['name']
					city['zoom'] = 9

with open('cities2.json', 'w') as new:
	json.dump(data, new)

text = open('cities2.json').read()
text = text.replace('}, {', '},\n{')
# Only uncomment this if you have backed up cities.json
open('../data/gis/cities.json', 'w').write('var cities = ' + text + ';')
