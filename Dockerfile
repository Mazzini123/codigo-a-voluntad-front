# Imagen de producción del front, en dos etapas.

# Etapa 1: compila la app con Node. Esta etapa se descarta al final.
FROM node:22-alpine AS build
WORKDIR /app

# Primero solo las dependencias: si package*.json no cambian, Docker reutiliza esta capa.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite reemplaza las VITE_* en el código al compilar: son argumentos de build,
# no variables que se lean al arrancar el contenedor.
ARG VITE_API_BASE_URL=/api
ARG VITE_LOGTO_ENDPOINT
ARG VITE_LOGTO_APP_ID
ARG VITE_LOGTO_API_RESOURCE
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_LOGTO_ENDPOINT=$VITE_LOGTO_ENDPOINT \
    VITE_LOGTO_APP_ID=$VITE_LOGTO_APP_ID \
    VITE_LOGTO_API_RESOURCE=$VITE_LOGTO_API_RESOURCE
RUN npm run build

# Etapa 2: Caddy sirve los archivos estáticos y reenvía /api al back.
FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
