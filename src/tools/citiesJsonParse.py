import json
import operator

with open('cities.json') as old:
	text = old.read()
	text = text.replace('var cities = ', '').rstrip(';')
	data = json.loads(text)
	for stateAbbreviation in data:
		data[stateAbbreviation] = sorted(data[stateAbbreviation], key=operator.itemgetter('pop'), reverse=True)
		data[stateAbbreviation] = sorted(data[stateAbbreviation], key=operator.itemgetter('rank'), reverse=True)
		data[stateAbbreviation] = sorted(data[stateAbbreviation], key=operator.itemgetter('zoom'))

		seats = 0
		for city in data[stateAbbreviation]:
			if city['rank'] > 0:
				seats += 1
		print stateAbbreviation + ': '  + str(seats)

		#for city in data[stateAbbreviation]:
#			if city['rank'] > 0 and city['zoom'] > 8:
#				city['zoom'] = 8

with open('cities2.json', 'w') as new:
	json.dump(data, new)

text = open('cities2.json').read()
text = text.replace('}, {', '},\n{')
open('../data/gis/cities.json', 'w').write('var cities = ' + text + ';')
