const fs = require('fs')

// Read current communities
const data = JSON.parse(
	fs.readFileSync('./src/routes/communities/pauseai-communities.json', 'utf8')
)

// Filter out all US communities
const nonUS = data.communities.filter((c) => c.parent_name !== 'PauseAI US')

// New US communities - using https://www.pauseai-us.org/local-groups/ for all links
const newUSCommunities = [
	{
		name: 'Phoenix',
		lat: 33.4484,
		lon: -112.074,
		link: 'https://www.pauseai-us.org/local-groups/',
		parent_name: 'PauseAI US'
	},
	{
		name: 'Las Positas College (Livermore)',
		lat: 37.6185,
		lon: -121.7639,
		link: 'https://www.pauseai-us.org/local-groups/',
		parent_name: 'PauseAI US'
	},
	{
		name: 'San Diego',
		lat: 32.7157,
		lon: -117.1611,
		link: 'https://www.pauseai-us.org/local-groups/',
		parent_name: 'PauseAI US'
	},
	{
		name: 'San Francisco',
		lat: 37.7749,
		lon: -122.4194,
		link: 'https://www.pauseai-us.org/local-groups/',
		parent_name: 'PauseAI US'
	},
	{
		name: 'UC Santa Barbara',
		lat: 34.414,
		lon: -119.8489,
		link: 'https://www.pauseai-us.org/local-groups/',
		parent_name: 'PauseAI US'
	},
	{
		name: 'Stanford',
		lat: 37.4275,
		lon: -122.1697,
		link: 'https://www.pauseai-us.org/local-groups/',
		parent_name: 'PauseAI US'
	},
	{
		name: 'UC Boulder',
		lat: 40.0076,
		lon: -105.2659,
		link: 'https://www.pauseai-us.org/local-groups/',
		parent_name: 'PauseAI US'
	},
	{
		name: 'Denver',
		lat: 39.7392,
		lon: -104.9903,
		link: 'https://www.pauseai-us.org/local-groups/',
		parent_name: 'PauseAI US'
	},
	{
		name: 'Hartford',
		lat: 41.7658,
		lon: -72.6734,
		link: 'https://www.pauseai-us.org/local-groups/',
		parent_name: 'PauseAI US'
	},
	{
		name: 'Washington DC',
		lat: 38.9072,
		lon: -77.0369,
		link: 'https://www.pauseai-us.org/local-groups/',
		parent_name: 'PauseAI US'
	},
	{
		name: 'Orlando',
		lat: 28.5383,
		lon: -81.3792,
		link: 'https://www.pauseai-us.org/local-groups/',
		parent_name: 'PauseAI US'
	},
	{
		name: 'Atlanta',
		lat: 33.749,
		lon: -84.388,
		link: 'https://www.pauseai-us.org/local-groups/',
		parent_name: 'PauseAI US'
	},
	{
		name: 'Boise',
		lat: 43.615,
		lon: -116.2023,
		link: 'https://www.pauseai-us.org/local-groups/',
		parent_name: 'PauseAI US'
	},
	{
		name: 'Lawrence',
		lat: 38.9717,
		lon: -95.2353,
		link: 'https://www.pauseai-us.org/local-groups/',
		parent_name: 'PauseAI US'
	},
	{
		name: 'Boston',
		lat: 42.3601,
		lon: -71.0589,
		link: 'https://www.pauseai-us.org/local-groups/',
		parent_name: 'PauseAI US'
	},
	{
		name: "Queen Anne's County",
		lat: 39.0379,
		lon: -75.9577,
		link: 'https://www.pauseai-us.org/local-groups/',
		parent_name: 'PauseAI US'
	},
	{
		name: 'Grand Rapids',
		lat: 42.9634,
		lon: -85.6681,
		link: 'https://www.pauseai-us.org/local-groups/',
		parent_name: 'PauseAI US'
	},
	{
		name: 'Washington University (Saint Louis)',
		lat: 38.6488,
		lon: -90.3108,
		link: 'https://www.pauseai-us.org/local-groups/',
		parent_name: 'PauseAI US'
	},
	{
		name: 'Jersey City',
		lat: 40.7178,
		lon: -74.0431,
		link: 'https://www.pauseai-us.org/local-groups/',
		parent_name: 'PauseAI US'
	},
	{
		name: 'Reno',
		lat: 39.5296,
		lon: -119.8138,
		link: 'https://www.pauseai-us.org/local-groups/',
		parent_name: 'PauseAI US'
	},
	{
		name: 'New York City',
		lat: 40.7128,
		lon: -74.006,
		link: 'https://www.pauseai-us.org/local-groups/',
		parent_name: 'PauseAI US'
	},
	{
		name: 'Columbus',
		lat: 39.9612,
		lon: -82.9988,
		link: 'https://www.pauseai-us.org/local-groups/',
		parent_name: 'PauseAI US'
	},
	{
		name: 'Dayton',
		lat: 39.7589,
		lon: -84.1916,
		link: 'https://www.pauseai-us.org/local-groups/',
		parent_name: 'PauseAI US'
	},
	{
		name: 'Portland',
		lat: 45.5051,
		lon: -122.675,
		link: 'https://www.pauseai-us.org/local-groups/',
		parent_name: 'PauseAI US'
	},
	{
		name: 'Philadelphia',
		lat: 39.9526,
		lon: -75.1652,
		link: 'https://www.pauseai-us.org/local-groups/',
		parent_name: 'PauseAI US'
	},
	{
		name: 'Pittsburgh',
		lat: 40.4406,
		lon: -79.9959,
		link: 'https://www.pauseai-us.org/local-groups/',
		parent_name: 'PauseAI US'
	},
	{
		name: 'Providence',
		lat: 41.824,
		lon: -71.4128,
		link: 'https://www.pauseai-us.org/local-groups/',
		parent_name: 'PauseAI US'
	},
	{
		name: 'Vanderbilt University (Nashville)',
		lat: 36.1447,
		lon: -86.8027,
		link: 'https://www.pauseai-us.org/local-groups/',
		parent_name: 'PauseAI US'
	},
	{
		name: 'Austin',
		lat: 30.2672,
		lon: -97.7431,
		link: 'https://www.pauseai-us.org/local-groups/',
		parent_name: 'PauseAI US'
	},
	{
		name: 'Houston',
		lat: 29.7604,
		lon: -95.3698,
		link: 'https://www.pauseai-us.org/local-groups/',
		parent_name: 'PauseAI US'
	},
	{
		name: 'Seattle',
		lat: 47.6062,
		lon: -122.3321,
		link: 'https://www.pauseai-us.org/local-groups/',
		parent_name: 'PauseAI US'
	}
]

// Combine non-US with new US communities
const newData = {
	communities: [...nonUS, ...newUSCommunities]
}

// Write the new file
fs.writeFileSync(
	'./src/routes/communities/pauseai-communities.json',
	JSON.stringify(newData, null, '\t')
)

console.log('Updated pauseai-communities.json')
console.log(`Removed ${data.communities.length - nonUS.length} old US communities`)
console.log(`Added ${newUSCommunities.length} new US communities`)
console.log(`Total communities: ${newData.communities.length}`)
