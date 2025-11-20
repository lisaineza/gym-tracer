// Frontend-only gym finder app
// API key is loaded from config.js
const $ = id => document.getElementById(id);
const resultsDiv = $("results");
const loader = $("loader");
const searchBtn = $("search-btn");
const gpsBtn = $("gps-btn");
const locationInput = $("location");

function showLoader(){ loader.style.display = "block"; resultsDiv.style.opacity = 0.6; }
function hideLoader(){ loader.style.display = "none"; resultsDiv.style.opacity = 1; }

// Build a gym card DOM node with slight reveal animation
function buildCard(gym) {
  const props = gym.properties || {};
  const name = props.name || "Unnamed Gym";
  const address = props.formatted || props.address_line1 || "Address not available";

  const card = document.createElement('div');
  card.className = 'gym-card';

  const icon = document.createElement('div');
  icon.className = 'icon';
  icon.textContent = '🏋️';

  const title = document.createElement('h3');
  title.textContent = name;

  const addr = document.createElement('p');
  addr.textContent = address;

  const stars = document.createElement('div');
  stars.className = 'stars';
  stars.textContent = '★'.repeat(Math.floor(Math.random()*3)+3);

  card.appendChild(icon);
  card.appendChild(title);
  card.appendChild(addr);
  card.appendChild(stars);

  // Display coordinates if available
  if (props.lon && props.lat) {
    const coords = document.createElement('p');
    coords.className = 'coordinates';
    coords.textContent = `📍 ${props.lat.toFixed(4)}, ${props.lon.toFixed(4)}`;
    card.appendChild(coords);

    // Link to OpenStreetMap
    const mapLink = document.createElement('a');
    mapLink.href = `https://www.openstreetmap.org/?mlat=${props.lat}&mlon=${props.lon}&zoom=15`;
    mapLink.target = '_blank';
    mapLink.className = 'map-link';
    mapLink.textContent = 'View on Map';
    card.appendChild(mapLink);
  }

  return card;
}

function renderResults(data) {
  resultsDiv.innerHTML = '';
  if (!data || !data.features || data.features.length === 0) {
    resultsDiv.innerHTML = '<p>No gyms found.</p>';
    return;
  }
  // stagger appending for nicer animation
  data.features.forEach((g, i) => {
    setTimeout(()=> {
      const card = buildCard(g);
      resultsDiv.appendChild(card);
    }, i * 80);
  });
}

// Geocode location text to coordinates
async function geocodeLocation(location) {
  const geocodeUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(location)}&apiKey=${CONFIG.GEOAPIFY_API_KEY}`;
  
  try {
    const res = await fetch(geocodeUrl);
    const data = await res.json();
    
    if (!data.features || data.features.length === 0) {
      resultsDiv.innerHTML = '<p>Location not found.</p>';
      return null;
    }
    
    const feature = data.features[0];
    return {
      lat: feature.properties.lat,
      lon: feature.properties.lon,
      name: feature.properties.formatted
    };
  } catch (err) {
    console.error('Geocoding error:', err);
    resultsDiv.innerHTML = '<p>Error finding location.</p>';
    return null;
  }
}

// Search gyms near coordinates
async function searchGymsNear(lat, lon) {
  const placesUrl = `https://api.geoapify.com/v2/places?categories=sport.fitness&filter=circle:${lon},${lat},5000&limit=20&apiKey=${CONFIG.GEOAPIFY_API_KEY}`;
  
  try {
    const res = await fetch(placesUrl);
    const data = await res.json();
    renderResults(data);
  } catch (err) {
    console.error('Search error:', err);
    resultsDiv.innerHTML = '<p>Error fetching gyms.</p>';
  }
}

async function searchByLocation(q) {
  showLoader();
  resultsDiv.innerHTML = '';
  
  if (!CONFIG.GEOAPIFY_API_KEY || CONFIG.GEOAPIFY_API_KEY === 'YOUR_GEOAPIFY_API_KEY_HERE') {
    resultsDiv.innerHTML = '<p>⚠️ Please add your Geoapify API key to config.js</p>';
    hideLoader();
    return;
  }
  
  try {
    const location = await geocodeLocation(q);
    if (location) {
      await searchGymsNear(location.lat, location.lon);
    }
  } catch (err) {
    resultsDiv.innerHTML = '<p>Error searching for gyms.</p>';
    console.error(err);
  } finally { hideLoader(); }
}

async function searchByCoords(lat, lon) {
  showLoader();
  resultsDiv.innerHTML = '';
  
  if (!CONFIG.GEOAPIFY_API_KEY || CONFIG.GEOAPIFY_API_KEY === 'YOUR_GEOAPIFY_API_KEY_HERE') {
    resultsDiv.innerHTML = '<p>⚠️ Please add your Geoapify API key to config.js</p>';
    hideLoader();
    return;
  }
  
  try {
    await searchGymsNear(lat, lon);
  } catch (err) {
    resultsDiv.innerHTML = '<p>Error fetching gyms.</p>';
    console.error(err);
  } finally { hideLoader(); }
}

// Event listeners
searchBtn.addEventListener('click', ()=> {
  const q = locationInput.value.trim(); 
  if (q) searchByLocation(q);
});

locationInput.addEventListener('keypress', e => { 
  if (e.key==='Enter') searchBtn.click(); 
});

gpsBtn.addEventListener('click', ()=> {
  if (!navigator.geolocation) { 
    alert('Geolocation not supported in your browser.'); 
    return; 
  }
  navigator.geolocation.getCurrentPosition(pos => {
    searchByCoords(pos.coords.latitude, pos.coords.longitude);
  }, err => alert('Unable to fetch location: ' + err.message));
});

// Initial focus
locationInput.focus();
