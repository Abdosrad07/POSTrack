# POSTrack Frontend - image de production
#
# Build multi-etapes :
#   1. "builder" : installe les dependances puis compile le bundle Vite ;
#      VITE_API_URL est injectee au moment du build (defaut "/api").
#   2. Image finale : Nginx sert le statique, applique le fallback SPA et
#      proxifie "/api" vers le service backend (voir nginx.conf) -- le
#      navigateur appelle donc le front en same-origin, sans CORS.

# ---- Etape 1 : build du bundle ----
FROM node:20-alpine AS builder

WORKDIR /app

# Cache de dependances : le lockfile seul suffit au cache Docker
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# URL de l'API bakee dans le bundle. En docker-compose, on garde "/api"
# pour passer par le proxy Nginx ; pour un deploiement sans proxy,
# construire avec --build-arg VITE_API_URL=https://api.exemple.com/api
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---- Etape 2 : service statique ----
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost/ >/dev/null 2>&1 || exit 1
