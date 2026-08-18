# Démarrage rapide — POSTrack

Guide minimal pour lancer l'application en local.

## Prérequis

- Python 3.11+
- Node.js 18+
- Git

## 1. Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
.\venv\Scripts\alembic upgrade head
.\venv\Scripts\python scripts/import_database.py
.\venv\Scripts\python main.py
```

→ API : http://localhost:8000  
→ Swagger : http://localhost:8000/docs

## 2. Frontend

```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```

⚠️ Lancez bien ces commandes depuis le dossier `frontend/`.

→ Interface : http://localhost:5173  
→ Si le port 5173 est déjà utilisé, Vite choisit automatiquement un port libre (par ex. 5174).

## 3. Connexion

| Email | Mot de passe |
|---|---|
| `admin@postrack.local` | `admin123` |

## Vérification

```powershell
curl http://localhost:8000/health
# {"status":"ok","database":"connected"}
```

## Suite

Pour importer les données Excel Master Color ou réinitialiser la base, voir [DATASETUP.md](DATASETUP.md).
