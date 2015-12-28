import json
import operator

with open('cities.json') as old:
	data = json.load(old)
	for state in data:
		data[state] = sorted(data[state], key=operator.itemgetter('pop'), reverse=True)
		for city in data[state]:
			city['pop'] = int(city['pop'])
			city['elev'] = int(city['elev'])
			if city['pop'] > 1500000:
				city['zoom'] = 4
			elif city['pop'] > 350000:
				city['zoom'] = 5
			elif city['pop'] > 100000:
				city['zoom'] = 6
			elif city['pop'] > 150000:
				city['zoom'] = 7
			elif city['pop'] > 50000:
				city['zoom'] = 8
			elif city['rank'] > 0:
				city['zoom'] = 9
			else:
				city['zoom'] = 10

		# Overrides to make the cities look good
		if state == 'AZ':
			for city in data[state]:
				if city['name'] == 'Mesa':
					city['zoom'] = 6
					print 'Processing override'
		if state == 'CA':
			for city in data[state]:
				if city['name'] == 'San Francisco':
					city['zoom'] = 5
					print 'Processing override'
				if city['name'] == 'Long Beach':
					city['zoom'] = 6
					print 'Processing override'
				if city['name'] == 'Oakland':
					city['zoom'] = 7
					print 'Processing override'
		if state == 'CO':
			for city in data[state]:
				if city['name'] == 'Colorado Springs':
					city['zoom'] = 6
					print 'Processing override'
		if state == 'MN':
			for city in data[state]:
				if city['name'] == 'Saint Paul':
					city['zoom'] = 8
					print 'Processing override'
		if state == 'TX':
			for city in data[state]:
				if city['name'] == 'Dallas':
					city['zoom'] = 5
					print 'Processing override'
				if city['name'] == 'Austin':
					city['zoom'] = 5
					print 'Processing override'
				if city['name'] == 'Fort Worth':
					city['zoom'] = 7
					print 'Processing override'
				if city['name'] == 'Amarillo':
					city['zoom'] = 6
					print 'Processing override'
				if city['name'] == 'Lubbock':
					city['zoom'] = 6
					print 'Processing override'
				if city['name'] == 'Arlington':
					city['zoom'] = 7
					print 'Processing override'
				if city['name'] == 'Garland':
					city['zoom'] = 7
					print 'Processing override'
				if city['name'] == 'Irving':
					city['zoom'] = 7
					print 'Processing override'
				if city['name'] == 'Plano':
					city['zoom'] = 7
					print 'Processing override'
		if state == 'KS':
			for city in data[state]:
				if city['name'] == 'Overland Park':
					city['zoom'] = 7
					print 'Processing override'
		if state == 'ID':
			for city in data[state]:
				if city['name'] == 'Boise City':
					city['zoom'] = 7
					print 'Processing override'
				if city['name'] == 'Nampa':
					city['zoom'] = 7
					print 'Processing override'
		if state == 'MD':
			for city in data[state]:
				if city['name'] == 'Columbia':
					city['zoom'] = 7
					print 'Processing override'
		if state == 'NJ':
			for city in data[state]:
				if city['name'] == 'Newark':
					city['zoom'] = 7
					print 'Processing override'
				if city['name'] == 'Jersey City':
					city['zoom'] = 7
					print 'Processing override'
		if state == 'NY':
			for city in data[state]:
				if city['name'] == 'Brooklyn':
					city['zoom'] = 7
					print 'Processing override'
				if city['name'] == 'Queens':
					city['zoom'] = 7
					print 'Processing override'
				if city['name'] == 'Manhattan':
					city['zoom'] = 7
					print 'Processing override'
				if city['name'] == 'The Bronx':
					city['zoom'] = 7
					print 'Processing override'
				if city['name'] == 'Staten Island':
					city['zoom'] = 7
					print 'Processing override'
		if state == 'VA':
			for city in data[state]:
				if city['name'] == 'Norfolk':
					city['zoom'] = 8
					print 'Processing override'
				if city['name'] == 'Chesapeake':
					city['zoom'] = 7
					print 'Processing override'
				if city['name'] == 'Arlington':
					city['zoom'] = 9
					print 'Processing override'
		if state == 'UT':
			for city in data[state]:
				if city['name'] == 'Salt Lake City':
					city['zoom'] = 5
					print 'Processing override'
				if city['name'] == 'West Valley City':
					city['zoom'] = 7
					print 'Processing override'
		if state == 'MA':
			for city in data[state]:
				if city['name'] == 'Worcester':
					city['zoom'] = 7
					print 'Processing override'
		if state == 'FL':
			for city in data[state]:
				if city['name'] == 'Orlando':
					city['zoom'] = 6
					print 'Processing override'
		if state == 'NV':
			for city in data[state]:
				if city['name'] == 'North Las Vegas':
					city['zoom'] = 10
					print 'Processing override'
				if city['name'] == 'Henderson':
					city['zoom'] = 7
					print 'Processing override'

		# limiting super populated states
		counter = 0
		if state == 'CA':
			for city in data[state]:
				if city['zoom'] < 7:
					counter = counter + 1
				if counter > 10:
					city['zoom'] = city['zoom'] + 1
		if state == 'AZ':
			for city in data[state]:
				if city['zoom'] < 7:
					counter = counter + 1
				if counter > 2:
					city['zoom'] = city['zoom'] + 1
		if state == 'TX':
			for city in data[state]:
				if city['zoom'] < 7:
					counter = counter + 1
				if counter > 9:
					city['zoom'] = city['zoom'] + 1


with open('../data/gis/cities.json', 'w') as new:
	json.dump(data, new)

text = open('../data/gis/cities.json').read()
text = text.replace('}, {', '},\n{')
open('../data/gis/cities.json', 'w').write('var cities = ' + text + ';')
