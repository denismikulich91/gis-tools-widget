import requests, pyproj
wgs84 = pyproj.CRS("EPSG:4326")  # WGS84 (lat, lon)
bng = pyproj.CRS("EPSG:27700")  # British National Grid (epsg 27700)

# Define the transformation function
transformer = pyproj.Transformer.from_crs(bng, wgs84, always_xy=True)

# Input EPSG:27700 coordinates (eastings, northings)
eastings, northings = 549644.552836007, 185979.17020579494

# Transform the coordinates
longitude, latitude = transformer.transform(eastings, northings)
print(f"Longitude: {longitude}, Latitude: {latitude}")

body = {"locations":[[longitude, latitude]],"range":[300,200,100]}
headers = {
    'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
    'Authorization': '5b3ce3597851110001cf6248575c5a9ab2384617b5665773e5e51a29',
    'Content-Type': 'application/json; charset=utf-8'
}
call = requests.post('https://api.openrouteservice.org/v2/isochrones/driving-car', json=body, headers=headers)

print(call.status_code, call.reason)
print(call.text)