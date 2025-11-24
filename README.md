# Backend (Geoapify) - Gym Finder

This backend provides simple endpoints to search for gyms using Geoapify.

Environment:
- Create `backend/.env` with:
  GEOAPIFY_API_KEY=82f836fa54264d27b5b868a374c89bc5
  FLASK_DEBUG=1

Run locally:
```
python app.py
```

Endpoints:
- GET /api/gyms?city=<city>
- GET /api/gyms?lat=<lat>&lon=<lon>&radius=<meters>
- GET /api/gym-details?name=<name>&near=<city or lat,lon>
- GET /api/gym-details?place_id=<id>
- GET /api/health

Notes:
- This backend uses Geoapify v1 geocode search for compatibility with free tier.
- Do not commit your real .env to public repos.
