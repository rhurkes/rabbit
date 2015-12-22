import json

with open('us_merged_small.js') as oldfile:
	data = json.load(oldfile)
	newdata = []
	for feature in data:
		newdata.append([feature['properties']['RTTYP'], feature['properties']['FULLNAME'], feature['geometry']['coordinates']])

with open('us_merged_small_2.js', 'w') as newfile:
	json.dump(newdata, newfile)
