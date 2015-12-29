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
		if state == 'CA':
			for city in data[state]:
				if city['name'] == 'San Francisco':
					city['zoom'] = 5
				if city['name'] == 'Long Beach':
					city['zoom'] = 7
				if city['name'] == 'Oakland':
					city['zoom'] = 7
				if city['name'] == 'Santa Ana':
					city['zoom'] = 7
		if state == 'CO':
			for city in data[state]:
				if city['name'] == 'Colorado Springs':
					city['zoom'] = 6
				if city['name'] == 'Aurora':
					city['zoom'] = 7
				if city['name'] == 'Pueblo':
					city['zoom'] = 6
				if city['name'] == 'Lakewood':
					city['zoom'] = 7
				if city['name'] == 'Thornton':
					city['zoom'] = 7
		if state == 'MT':
			for city in data[state]:
				if city['name'] == 'Billings':
					city['zoom'] = 6
				if city['name'] == 'Butte':
					city['zoom'] = 6
		if state == 'MN':
			for city in data[state]:
				if city['name'] == 'Saint Paul':
					city['zoom'] = 8
				if city['name'] == 'Duluth':
					city['zoom'] = 6
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
				if city['name'] == 'Dodge City':
					city['zoom'] = 6
				if city['name'] == 'Olathe':
					city['zoom'] = 7
		if state == 'IL':
			for city in data[state]:
				if city['name'] == 'Aurora':
					city['zoom'] = 7
				if city['name'] == 'Naperville':
					city['zoom'] = 8
				if city['name'] == 'Elgin':
					city['zoom'] = 7
				if city['name'] == 'Joliet':
					city['zoom'] = 7
		if state == 'ID':
			for city in data[state]:
				if city['name'] == 'Boise City':
					city['zoom'] = 7
				if city['name'] == 'Nampa':
					city['zoom'] = 7
		if state == 'IN':
			for city in data[state]:
				if city['name'] == 'South Bend':
					city['zoom'] = 7
		if state == 'ME':
			for city in data[state]:
				if city['name'] == 'Portland':
					city['zoom'] = 6
		if state == 'MD':
			for city in data[state]:
				if city['name'] == 'Columbia':
					city['zoom'] = 7
		if state == 'MI':
			for city in data[state]:
				if city['name'] == 'Ann Arbor':
					city['zoom'] = 7
				if city['name'] == 'Warren':
					city['zoom'] = 9
				if city['name'] == 'Sterling Heights':
					city['zoom'] = 9
				if city['name'] == 'Lansing':
					city['zoom'] = 7
				if city['name'] == 'Flint':
					city['zoom'] = 7
		if state == 'MO':
			for city in data[state]:
				if city['name'] == 'Kansas City':
					city['zoom'] = 9
				if city['name'] == 'Independence':
					city['zoom'] = 9
		if state == 'ND':
			for city in data[state]:
				if city['name'] == 'Bismarck':
					city['zoom'] = 6
		if state == 'NJ':
			for city in data[state]:
				if city['name'] == 'Newark':
					city['zoom'] = 7
					print 'Processing override'
				if city['name'] == 'Jersey City':
					city['zoom'] = 7
					print 'Processing override'
		if state == 'LA':
			for city in data[state]:
				if city['name'] == 'Metairie':
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
				if city['name'] == 'Yonkers':
					city['zoom'] = 10
		if state == 'NC':
			for city in data[state]:
				if city['name'] == 'Winston-Salem':
					city['zoom'] = 7
				if city['name'] == 'Durham':
					city['zoom'] = 7
				if city['name'] == 'High Point':
					city['zoom'] = 7
				if city['name'] == 'Raleigh':
					city['zoom'] = 7
				if city['name'] == 'Cary':
					city['zoom'] = 9
		if state == 'OK':
			for city in data[state]:
				if city['name'] == 'Norman':
					city['zoom'] = 7
		if state == 'OR':
			for city in data[state]:
				if city['name'] == 'Gresham':
					city['zoom'] = 7
		if state == 'SD':
			for city in data[state]:
				if city['name'] == 'Rapid City':
					city['zoom'] = 6
		if state == 'TN':
			for city in data[state]:
				if city['name'] == 'Murfreesboro':
					city['zoom'] = 7
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
				if city['name'] == 'Newport News':
					city['zoom'] = 8
				if city['name'] == 'Hampton':
					city['zoom'] = 8
				if city['name'] == 'Alexandria':
					city['zoom'] = 8
		if state == 'UT':
			for city in data[state]:
				if city['name'] == 'Salt Lake City':
					city['zoom'] = 5
				if city['name'] == 'West Valley City':
					city['zoom'] = 7
				if city['name'] == 'West Jordan':
					city['zoom'] = 7
		if state == 'MA':
			for city in data[state]:
				if city['name'] == 'Worcester':
					city['zoom'] = 7
				if city['name'] == 'Lowell':
					city['zoom'] = 8
				if city['name'] == 'Cambridge':
					city['zoom'] = 8
		if state == 'FL':
			for city in data[state]:
				if city['name'] == 'Orlando':
					city['zoom'] = 6
				if city['name'] == 'Saint Petersburg':
					city['zoom'] = 7
		if state == 'NV':
			for city in data[state]:
				if city['name'] == 'North Las Vegas':
					city['zoom'] = 10
					print 'Processing override'
				if city['name'] == 'Henderson':
					city['zoom'] = 7
					print 'Processing override'
		if state == 'WA':
			for city in data[state]:
				if city['name'] == 'Bellevue':
					city['zoom'] = 10
				if city['name'] == 'Vancouver':
					city['zoom'] = 7

		# limiting super populated states
		counter = 0
		if state == 'AZ':
			for city in data[state]:
				if city['zoom'] < 7:
					counter = counter + 1
				if counter > 2:
					city['zoom'] = city['zoom'] + 1
		if state == 'CA':
			for city in data[state]:
				if city['zoom'] < 7:
					counter = counter + 1
					if counter > 8:
						city['zoom'] = city['zoom'] + 1
		if state == 'CO':
			for city in data[state]:
				if city['zoom'] < 7:
					counter = counter + 1
					if counter > 4:
						city['zoom'] = city['zoom'] + 1
		if state == 'CT':
			for city in data[state]:
				if city['zoom'] < 7:
					city['zoom'] = city['zoom'] + 1
		if state == 'FL':
			for city in data[state]:
				if city['zoom'] < 7:
					counter = counter + 1
				if counter > 5:
					city['zoom'] = city['zoom'] + 1
		if state == 'NJ':
			for city in data[state]:
				if city['zoom'] < 7:
					city['zoom'] = city['zoom'] + 1
		if state == 'RI':
			for city in data[state]:
				if city['zoom'] < 7:
					city['zoom'] = city['zoom'] + 1
		if state == 'TX':
			for city in data[state]:
				if city['zoom'] < 7:
					counter = counter + 1
				if counter > 9:
					city['zoom'] = city['zoom'] + 1
		if state == 'VT':
			for city in data[state]:
				if city['zoom'] < 7:
					city['zoom'] = city['zoom'] + 1

with open('../data/gis/cities.json', 'w') as new:
	json.dump(data, new)

text = open('../data/gis/cities.json').read()
text = text.replace('}, {', '},\n{')
open('../data/gis/cities.json', 'w').write('var cities = ' + text + ';')
