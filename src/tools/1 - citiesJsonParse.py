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
		seatLimit = seats / 2

		seatsDisplayed = 0
		for city in data[stateAbbreviation]:
			if city['rank'] > 0 and city['zoom'] > 8:
				if seatsDisplayed < seatLimit:
					city['zoom'] = 8
					seatsDisplayed += 1
				else:
					city['zoom'] = 9
		print stateAbbreviation + 'seats: ' + str(seats) + ', displayed at 8: ' + str(seatsDisplayed)

		populatedCities = 0
		for city in data[stateAbbreviation]:
			if city['zoom'] > 9 and city['pop'] > 0:
				populatedCities += 1
		populatedLimit = populatedCities / 3
		populatedDisplayed = 0
		for city in data[stateAbbreviation]:
			if city['zoom'] > 9:
				if populatedDisplayed < populatedLimit:
					city['zoom'] = 11
				elif populatedDisplayed < populatedLimit * 2:
					city['zoom'] = 11
				elif city['pop'] > 0:
					city['zoom'] = 12
				else:
					city['zoom'] = 13
				

with open('cities2.json', 'w') as new:
	json.dump(data, new)

text = open('cities2.json').read()
text = text.replace('}, {', '},\n{')
# Only uncomment this if you have backed up cities.json
#open('../data/gis/cities.json', 'w').write('var cities = ' + text + ';')
