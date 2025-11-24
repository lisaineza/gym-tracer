// Frontend logic with animations
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

  // if coordinates are present, request map image from backend route
  if (props.lon && props.lat) {
    const img = document.createElement('img');
    img.className = 'mini-map';
    img.alt = 'Map preview';
    img.src = `/api/static-map?lon=${props.lon}&lat=${props.lat}`;
    card.appendChild(img);
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

async function searchByLocation(q) {
  showLoader();
  resultsDiv.innerHTML = '';
  try {
    const res = await fetch(`/api/gyms?location=${encodeURIComponent(q)}`);
    const data = await res.json();
    renderResults(data);
  } catch (err) {
    resultsDiv.innerHTML = '<p>Error fetching results.</p>';
    console.error(err);
  } finally { hideLoader(); }
}

async function searchByCoords(lat, lon) {
  showLoader();
  resultsDiv.innerHTML = '';
  try {
    const res = await fetch(`/api/gyms?lat=${lat}&lon=${lon}`);
    const data = await res.json();
    renderResults(data);
  } catch (err) {
    resultsDiv.innerHTML = '<p>Error fetching results.</p>';
    console.error(err);
  } finally { hideLoader(); }
}

// events
searchBtn.addEventListener('click', ()=> {
  const q = locationInput.value.trim(); if (q) searchByLocation(q);
});
locationInput.addEventListener('keypress', e => { if (e.key==='Enter') searchBtn.click(); });
gpsBtn.addEventListener('click', ()=> {
  if (!navigator.geolocation) { alert('Geolocation not supported.'); return; }
  navigator.geolocation.getCurrentPosition(pos => {
    searchByCoords(pos.coords.latitude, pos.coords.longitude);
  }, err => alert('Unable to fetch location: ' + err.message));
});

// initial focus
locationInput.focus();
