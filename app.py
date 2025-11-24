from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import os
import requests
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)


# ---------------------------------------------------------
# HOME ROUTE (SERVES FRONTEND)
# ---------------------------------------------------------
@app.route("/")
def home():
    return render_template("index.html")


# ---------------------------------------------------------
# GET GYMS FROM GEOAPIFY
# ---------------------------------------------------------
@app.route("/api/gyms")
def get_gyms():
    api_key = os.getenv("GEOAPIFY_API_KEY")
    if not api_key:
        return jsonify({"error": "Missing GEOAPIFY_API_KEY"}), 400

    user_location = request.args.get("location", "Kigali, Rwanda")

    # 1️⃣ Convert text location → lat/lon
    geocode_url = (
        f"https://api.geoapify.com/v1/geocode/search?"
        f"text={user_location}&apiKey={api_key}"
    )
    geo_res = requests.get(geocode_url).json()

    if not geo_res.get("features"):
        return jsonify({"error": "Location not found"}), 404

    lat = geo_res["features"][0]["properties"]["lat"]
    lon = geo_res["features"][0]["properties"]["lon"]

    # 2️⃣ Search gyms near coordinates
    places_url = (
        f"https://api.geoapify.com/v2/places?"
        f"categories=sport.fitness&"
        f"filter=circle:{lon},{lat},5000&"
        f"limit=20&"
        f"apiKey={api_key}"
    )
    places_res = requests.get(places_url).json()

    return jsonify(places_res)


# ---------------------------------------------------------
# STATIC MAP PREVIEW IMAGE
# ---------------------------------------------------------
@app.route("/api/static-map")
def static_map():
    api_key = os.getenv("GEOAPIFY_API_KEY")
    if not api_key:
        return jsonify({"error": "Missing GEOAPIFY_API_KEY"}), 400

    lat = request.args.get("lat")
    lon = request.args.get("lon")

    if not lat or not lon:
        return jsonify({"error": "Missing coordinates"}), 400

    # 3️⃣ Geoapify static map API
    map_url = (
        "https://maps.geoapify.com/v1/staticmap"
        f"?style=osm-bright&width=300&height=200"
        f"&center=lonlat:{lon},{lat}"
        f"&zoom=16"
        f"&marker=lonlat:{lon},{lat};color:%23ff0000;size:medium"
        f"&apiKey={api_key}"
    )

    image_data = requests.get(map_url)

    return image_data.content, 200, {"Content-Type": "image/png"}


# ---------------------------------------------------------
# START FLASK SERVER
# ---------------------------------------------------------
if __name__ == "__main__":
    app.run(debug=True)