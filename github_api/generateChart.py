import pandas as pd
import altair as alt
import vega

# Your data (replace with your dataset)
data = [
    {"username": "markt-asf", "count": 0, "location": None,
        "latitude": None, "longitude": None},
    {"username": "fhanik", "count": 0, "location": 'Vancouver, WA, USA',
        "latitude": 45.6387, "longitude": -122.6615},
    {"username": "KangZhiDong", "count": 0, "location": 'Made in China',
        "latitude": 35.8617, "longitude": 104.1954},
    {"username": "jfclere", "count": 0, "location": 'Neuchatel',
        "latitude": 46.9951, "longitude": 6.9385},
    {"username": "jbampton", "count": 0, "location": 'Brisbane, Australia',
        "latitude": -27.4698, "longitude": 153.0251},
    {"username": "johnkdev", "count": 0, "location": None,
        "latitude": None, "longitude": None},
    {"username": "xxeol2", "count": 0, "location": None,
        "latitude": None, "longitude": None},
    {"username": "rotty3000", "count": 0, "location": 'Ontario, Canada',
        "latitude": 51.2538, "longitude": -85.3232},
    {"username": "sylvainlaurent", "count": 0,
        "location": None, "latitude": None, "longitude": None},
    {"username": "csutherl", "count": 0, "location": 'North Carolina, USA',
        "latitude": 35.7822, "longitude": -80.7935},
    {"username": "isapir", "count": 0, "location": None,
        "latitude": None, "longitude": None},
    {"username": "aooohan", "count": 0, "location": 'Beijing',
        "latitude": 39.9042, "longitude": 116.4074},
    {"username": "olamy", "count": 0, "location": 'Brisbane, Australia',
        "latitude": -27.4698, "longitude": 153.0251},
    {"username": "bohmber", "count": 0, "location": None,
        "latitude": None, "longitude": None},
    {"username": "tianshuang", "count": 0, "location": None,
        "latitude": None, "longitude": None},
    {"username": "costinm", "count": 0, "location": 'Palo Alto, CA',
        "latitude": 37.4419, "longitude": -122.1430},
    {"username": "FSchumacher", "count": 0, "location": None,
        "latitude": None, "longitude": None},
    {"username": "larsgrefer", "count": 0, "location": 'Dortmund, Germany',
        "latitude": 51.5136, "longitude": 7.4653},
    {"username": "michael-o", "count": 0, "location": 'Berlin, Germany',
        "latitude": 52.5200, "longitude": 13.4050},
    {"username": "woonsan", "count": 0, "location": 'Greater Boston Area',
        "latitude": 42.3601, "longitude": -71.0589},
    {"username": "ebourg", "count": 0, "location": 'Paris',
        "latitude": 48.8566, "longitude": 2.3522},
    {"username": "YoavShapira", "count": 0, "location": 'San Francisco, CA',
        "latitude": 37.7749, "longitude": -122.4194},
    {"username": "violetagg", "count": 0, "location": None,
        "latitude": None, "longitude": None},
    {"username": "sdeleuze", "count": 0, "location": 'Lyon',
        "latitude": 45.75, "longitude": 4.85},
    {"username": "rainerjung", "count": 0, "location": None,
        "latitude": None, "longitude": None},
    {"username": "rmaucher", "count": 0, "location": 'France',
        "latitude": 46.603354, "longitude": 1.888334},
    {"username": "mturk", "count": 0, "location": None,
        "latitude": None, "longitude": None},
    {"username": "martin-g", "count": 0, "location": 'Veliko Tarnovo, Bulgaria',
        "latitude": 43.0757, "longitude": 25.6172},
    {"username": "ChristopherSchultz", "count": 0,
        "location": 'Arlington, VA', "latitude": 38.8816, "longitude": -77.0910},
    {"username": "tbw777", "count": 0, "location": 'Brazil',
        "latitude": -14.2350, "longitude": -51.9253}
]

# Create a DataFrame from your data
df = pd.DataFrame(data)

# Create a Vega-Lite chart
chart = alt.Chart(df).mark_circle(size=50, color="blue").encode(
    latitude='latitude:Q',
    longitude='longitude:Q',
    tooltip=['username:N', 'location:N']
)

chart.save("map_chart.html")
