"""Diagnostic : parse le KML d'une carte My Maps étape par étape."""
import io
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.services.bts_maps_service import parse_kml_placemarks, fetch_kml_bytes

url = sys.argv[1]
data = fetch_kml_bytes(url)
print("KML taille:", len(data), "octets")
Path("maps_debug.kml").write_bytes(data)
print("Placemark occurrences:", data.count(b"<Placemark>"))
print("coordinates occurrences:", data.count(b"<coordinates>"))

points = parse_kml_placemarks(data)
print("Parseurs → points:", len(points))
for p in points[:5]:
    print("  ", p)