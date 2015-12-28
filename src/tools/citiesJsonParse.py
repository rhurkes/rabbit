import json
import operator

with open('cities.json') as old:
	data = json.load(old)
	for state in data:
		data[state] = sorted(data[state], key=operator.itemgetter('pop'), reverse=True)
		for city in data[state]:
			city['pop'] = int(city['pop'])
			city['elev'] = int(city['elev'])
		# Overrides to make the cities look good
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
		if state == 'CA':
			for city in data[state]:
				if city['name'] == 'San Francisco':
					city['zoom'] = 5
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

with open('cities2.json', 'w') as new:
	json.dump(data, new)
