# POSTrack Backend - image de production (MySQL)
#
# Build multi-etapes : l'etape "builder" compile les dependances qui
# necessitent des paquets systeme (build-essential, headers MySQL),
# l'image finale ne contient que le resultat installe + le code
# applicatif -- reduit sensiblement la taille de l'image livree et sa
# surface d'attaque (pas de compilateur ni d'outils de build en prod).

# ---- Etape 1 : build des dependances Python ----
FROM python:3.12-slim AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    default-libmysqlclient-dev \
    build-essential \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# ---- Etape 2 : image finale, allegee ----
FROM python:3.12-slim

# Seule la bibliotheque client MySQL (runtime, pas les headers de
# compilation) est necessaire a l'execution -- pas build-essential ni
# pkg-config dans l'image finale. curl reste utile pour le HEALTHCHECK.
RUN apt-get update && apt-get install -y --no-install-recommends \
    default-mysql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Utilisateur non-root : bonne pratique de securite standard, evite
# qu'un processus applicatif compromis n'agisse avec les privileges
# root du conteneur.
RUN groupadd --system postrack && useradd --system --gid postrack --create-home postrack

WORKDIR /app

COPY --from=builder /root/.local /home/postrack/.local
COPY . .

RUN mkdir -p /app/import_reports && chown -R postrack:postrack /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/home/postrack/.local/bin:${PATH}"

USER postrack

EXPOSE 8000

# Verifie periodiquement que l'API repond, pour que docker-compose /
# l'orchestrateur puisse detecter un conteneur bloque et le redemarrer.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Applique les migrations Alembic puis lance l'API. En cas d'echec de
# connexion transitoire a MySQL au demarrage du conteneur (base pas
# encore prete), le "depends_on: condition: service_healthy" de
# docker-compose garantit deja la disponibilite du service "db" avant
# ce point.
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2"]
