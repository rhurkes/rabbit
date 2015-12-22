import requests

base = 'http://www2.census.gov/geo/tiger/TIGER2015/PRISECROADS/tl_2015_{stfips}_prisecroads.zip'

for num in range(1, 57):
	fips = str(num)
	if num < 10:
		fips = '0' + fips
	url = base.replace('{stfips}', fips)
	response = requests.get(url)
	if response.status_code == 200:
		with open('tl_2015_' + fips + '_prisecroads.zip', 'wb') as f:
			f.write(response.content)
