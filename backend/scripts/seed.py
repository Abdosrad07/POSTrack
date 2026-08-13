"""
Point d'entrée rétrocompatible — délègue à import_database.py.

Usage (depuis backend/) : python scripts/seed.py [--force]
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
sys.path.insert(0, str(Path(__file__).resolve().parent))

from import_database import import_data

if __name__ == "__main__":
    force = "--force" in sys.argv
    import_data(force=force)
