# POSTrack — Frontend

Interface React pour POSTrack.

## Documentation

→ **[docs/frontend/README.md](../docs/frontend/README.md)** — structure et pages connectées  
→ **[docs/guides/GETTING_STARTED.md](../docs/guides/GETTING_STARTED.md)** — installation

## Démarrage

```powershell
# À exécuter depuis C:\Users\HP\Desktop\POSTrack\frontend
cd frontend
npm install
copy .env.example .env
npm run dev
```

→ http://localhost:5173  
→ Si le port 5173 est déjà occupé, Vite démarre sur le port suivant disponible.

## Connexion au backend réel

Créez un fichier `frontend/.env` à partir de `frontend/.env.example`, puis adaptez les variables si besoin :

```env
VITE_API_URL=/api
VITE_DISABLE_DEMO_BANNER=true
VITE_BTS_DEBUG=false
```

- `VITE_API_URL` : URL du backend réel consommé par le frontend.
- `VITE_DISABLE_DEMO_BANNER` : masque les bandeaux de données de démonstration quand le backend est disponible.
- `VITE_BTS_DEBUG` : active les logs techniques BTS dans la console navigateur.

### Proxy de développement (recommandé)

En dev, laissez `VITE_API_URL=/api` : le navigateur appelle le serveur Vite en
same-origin et `vite.config.ts` (`server.proxy`) relaie `/api` vers le backend.
Avantages :
- aucun problème de CORS ;
- insensible au bind réseau du backend (`127.0.0.1` vs `::1`). Sous Windows,
  uvicorn lancé avec `--host ::` n'écoute qu'en IPv6, et `localhost` peut être
  résolu vers `::1` par le navigateur — d'où des erreurs réseau avec une URL
  absolue mal choisie.

Pour un build de production ou un backend distant, mettez une URL absolue
(`http://127.0.0.1:8000/api`, `http://[::1]:8000/api`, `http://192.168.x.x:8000/api`).

Après modification du `.env` ou de `vite.config.ts`, redémarrez Vite.

Après modification du fichier `.env`, redémarrez le frontend pour que Vite recharge les variables.

## Workflows équipe

- [docs/FRONTEND_WORKFLOW.md](docs/FRONTEND_WORKFLOW.md)
- [docs/FEATURE_WORKFLOW.md](docs/FEATURE_WORKFLOW.md)
- [docs/TRAVAIL_PARALLEL.md](docs/TRAVAIL_PARALLEL.md)
