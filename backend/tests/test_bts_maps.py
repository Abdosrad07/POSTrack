"""Tests du service d'import BTS via fichier interne sécurisé."""
import pytest

from app.core.errors import ValidationErrorApp
from app.services.bts_maps_service import parse_kml_placemarks, validate_internal_import_filename

SAMPLE_KML = """<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>BTS Test</name>
    <Placemark><name>DLA001_Akwa</name>
      <Point><coordinates>9.6985,4.0483,0</coordinates></Point>
    </Placemark>
    <Placemark><name>YDE001_Ahala</name>
      <Point><coordinates>11.4840,3.8420,0</coordinates></Point>
    </Placemark>
    <Placemark>
      <name>Sans coords</name>
      <LineString><coordinates>1,2 3,4</coordinates></LineString>
    </Placemark>
  </Document>
</kml>
""".encode("utf-8")


def test_validate_internal_import_filename_accepts_supported_formats():
    assert validate_internal_import_filename("import.kml") == "import.kml"
    assert validate_internal_import_filename("plan.csv") == "plan.csv"


def test_parse_kml_is_disabled_and_rejects_payload():
    with pytest.raises(ValidationErrorApp):
        parse_kml_placemarks(SAMPLE_KML)


def test_parse_kml_rejects_illformed_xml():
    with pytest.raises(ValidationErrorApp):
        parse_kml_placemarks(b"<kml><Document>")


def test_validate_internal_import_filename_rejects_unsupported_extension():
    with pytest.raises(ValidationErrorApp):
        validate_internal_import_filename("secret.txt")