# POSTrack — Frontend

Application React (Vite + Tailwind) pour la gestion Partenaires → DSM → BTS → POS.

## Structure

```
frontend/src/
├── App.tsx                 # Routes principales
├── main.tsx                # Point d'entrée
├── pages/                  # Pages par module
│   ├── auth/               # Login
│   ├── pos/                # Liste, détail, création POS
│   ├── partenaires/
│   ├── dsm/
│   ├── bts/
│   ├── primes/
│   ├── clients/            # (pages prêtes, API à brancher)
│   ├── requetes/
│   └── ...
├── components/             # Composants réutilisables par domaine
│   ├── POS/
│   ├── BTS/
│   ├── Common/             # Button, Alert, StatusBadge…
│   └── Layout/
├── services/               # Appels API (axios)
├── context/                # AuthContext
├── hooks/
└── routes/                 # ProtectedRoute
```

## Pages connectées à l'API

| Route | Page | API |
|---|---|---|
| `/login` | LoginPage | `/api/auth/login` |
| `/` | Dashboard | `/api/analytics/dashboard`, `/api/pos` |
| `/pos` | POSListPage | `/api/pos` |
| `/partenaires` | PartnersList | `/api/partenaires` |
| `/dsm` | DSMListPage | `/api/dsm` |
| `/bts` | BTSListPage | `/api/bts` |
| `/primes` | PrimesListPage | `/api/primes` |

## Configuration

```env
# frontend/.env
VITE_API_URL=http://localhost:8000/api
```

## Commandes

```powershell
cd frontend
npm install
npm run dev      # développement
npm run build    # production
npm run test     # tests Vitest
```

## Workflows équipe

- [FRONTEND_WORKFLOW.md](../../frontend/docs/FRONTEND_WORKFLOW.md)
- [FEATURE_WORKFLOW.md](../../frontend/docs/FEATURE_WORKFLOW.md)
- [TRAVAIL_PARALLEL.md](../../frontend/docs/TRAVAIL_PARALLEL.md)

## Note — dossier `EmptyState/`

Le sous-dossier `components/Common/EmptyState/` contient d'**anciens fichiers scaffold** (copies de pages/login du début de projet). Ils ne sont **pas utilisés** par l'application active — ne pas modifier pour la démo.
