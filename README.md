# Gym Finder - Frontend App

A simple, pure frontend gym finder application that searches for nearby gyms using the Geoapify API.

##  Features

-  Search gyms by location name
-  Search gyms using your current GPS location
-  View gym locations on OpenStreetMap
-  Fast, no backend required
-  Fully responsive design
-  Secure API key configuration

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

** IMPORTANT**: `config.js` is in `.gitignore` - your API key will never be committed!

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Any modern browser with Geolocation API support

## Notes

- GPS location requires HTTPS or localhost
- API calls are rate-limited (free tier: 3,000/day)
- No user data is stored

##  Deployment Guide

### Local Development
1. Clone the repository
2. Edit `config.js` with your Geoapify API key
3. Open `index.html` in your browser (or use a local server)

### Option 1: GitHub Pages (Free & Easy)
```bash
# Push to your GitHub repository
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main

# Enable GitHub Pages in Settings > Pages
# Select 'main' branch as source
# Your app will be live at: https://yourusername.github.io/gym-tracer
```

### Option 2: Netlify (Free & Fast)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy directly
netlify deploy --prod

# Or connect your GitHub repo for automatic deploys
```

### Option 3: Vercel (Free & Optimized)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Option 4: AWS S3 + CloudFront
```bash
# Create S3 bucket and upload files
aws s3 mb s3://gym-tracer
aws s3 cp . s3://gym-tracer --recursive

# Set up CloudFront distribution for caching
# This serves your app globally with high performance
```

### Option 5: Traditional Web Server (Nginx/Apache)
```bash
# Copy files to server
scp -r ./* user@server:/var/www/gym-tracer/

# Nginx configuration (/etc/nginx/sites-available/gym-tracer)
server {
    listen 80;
    server_name gym-tracer.com;
    root /var/www/gym-tracer;
    index index.html;
    
    # Enable HTTPS
    listen 443 ssl;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

##  Load Balancer Setup (Multi-Server Deployment)

### Architecture Overview
If you scale to multiple servers, here's how to set up a load balancer:

```
    Client Requests
           |
      Load Balancer (Nginx/HAProxy)
           |
    -------|-------
    |             |
  Server 1    Server 2
  (Nginx)     (Nginx)
```

### Nginx Load Balancer Configuration
```bash
# /etc/nginx/nginx.conf
upstream gym_tracer_backend {
    least_conn;  # Load balancing algorithm
    server server1.example.com:80 weight=1;
    server server2.example.com:80 weight=1;
    keepalive 32;
}

server {
    listen 80;
    server_name gym-tracer.com;

    location / {
        proxy_pass http://gym_tracer_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
    }
}
```

### HAProxy Load Balancer Configuration
```bash
# /etc/haproxy/haproxy.cfg
global
    maxconn 4096
    
frontend frontend_gym_tracer
    bind *:80
    bind *:443 ssl crt /path/to/cert.pem
    default_backend backend_servers

backend backend_servers
    balance leastconn
    option httpchk GET /health
    server server1 server1.example.com:80 check
    server server2 server2.example.com:80 check
    
    # Session persistence (if needed)
    cookie SERVERID insert indirect nocache
    server srv1 server1.example.com:80 cookie srv1
    server srv2 server2.example.com:80 cookie srv2
```

##  Testing & Verification

### 1. Functional Testing
```bash
# Test 1: Search by Location
curl "http://localhost/index.html"
# Expected: HTML loads successfully

# Test 2: API Key Validation
# Open browser console and verify CONFIG.GEOAPIFY_API_KEY is set
# Check Network tab - API calls should go to api.geoapify.com
```

### 2. Load Balancer Testing
```bash
# Test traffic distribution
for i in {1..100}; do
    curl http://gym-tracer.com/
done

# Check server logs to verify traffic is distributed
tail -f /var/log/nginx/access.log
```

### 3. Performance Testing
```bash
# Install Apache Bench
apt-get install apache2-utils

# Load test with 1000 concurrent requests
ab -n 1000 -c 100 http://gym-tracer.com/

# Expected results:
# - Requests per second > 100
# - Failed requests = 0
# - Load balanced across servers
```

### 4. Health Check Verification
```bash
# Verify server health
curl -I http://server1.example.com/health
curl -I http://server2.example.com/health
# Expected: HTTP 200

# Monitor load balancer status
# Nginx: curl http://load-balancer/nginx_status
# HAProxy: http://load-balancer:8404/stats
```

### 5. Browser Testing Checklist
- [ ] Search by city name works
- [ ] GPS location button works
- [ ] Map links open in new tab
- [ ] App works on Chrome, Firefox, Safari
- [ ] Responsive design on mobile/tablet
- [ ] No console errors
- [ ] API key is not exposed in network requests

### 6. Failover Testing
```bash
# Simulate server failure
# Stop server 1: systemctl stop nginx
# Verify traffic routes to server 2
curl http://gym-tracer.com/ -v

# Restart server 1: systemctl start nginx
# Verify load balancer recognizes it
```

##  Monitoring & Logging

### Enable Access Logging
```bash
# Nginx - /etc/nginx/sites-available/gym-tracer
access_log /var/log/nginx/gym-tracer_access.log;
error_log /var/log/nginx/gym-tracer_error.log;
```

### Monitor Server Performance
```bash
# CPU & Memory usage
top -b -n 1 | head -20

# Network connections
netstat -an | grep ESTABLISHED | wc -l

# Log analysis
tail -f /var/log/nginx/gym-tracer_access.log | grep ERROR
```

##  Security Checklist

- [x] API key stored in `.gitignore`
- [x] HTTPS enabled on production
- [x] CORS configured properly
- [x] No sensitive data in frontend code
- [x] Rate limiting on API calls
- [x] Security headers configured:
  ```nginx
  add_header X-Frame-Options "SAMEORIGIN";
  add_header X-Content-Type-Options "nosniff";
  add_header X-XSS-Protection "1; mode=block";
  ```
