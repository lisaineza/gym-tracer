# Gym Finder - Frontend App

A simple, pure frontend gym finder application that searches for nearby gyms using the Geoapify API.

## Features

- 🔍 Search gyms by location name
- 📍 Search gyms using your current GPS location
- 🗺️ View gym locations on OpenStreetMap
- ⚡ Fast, no backend required
- 📱 Fully responsive design

## Setup

### 1. Get API Key
- Go to [Geoapify](https://geoapify.com/)
- Sign up for a free account
- Get your API key from the dashboard

### 2. Configure API Key
Open `config.js` and replace the placeholder:
```javascript
const CONFIG = {
  GEOAPIFY_API_KEY: 'YOUR_GEOAPIFY_API_KEY_HERE'
};
```

### 3. Run the App
Simply open `index.html` in your web browser:
- Double-click `index.html`, or
- Right-click and select "Open with" your browser

## How to Use

1. **Search by Location**: Type a city name (e.g., "Kigali, Rwanda") and click "Search"
2. **Use GPS**: Click "Use GPS location" to search from your current location
3. **View Details**: Click on any gym location link to view it on OpenStreetMap

## Project Structure

```
gym-tracer/
├── index.html      # Main HTML file
├── script.js       # Frontend JavaScript logic
├── style.css       # Styling
├── config.js       # API configuration (ADD YOUR KEY HERE)
└── README.md       # This file
```

**⚠️ IMPORTANT**: `config.js` is in `.gitignore` - your API key will never be committed!

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Any modern browser with Geolocation API support

## Notes

- GPS location requires HTTPS or localhost
- API calls are rate-limited (free tier: 3,000/day)
- No user data is stored
