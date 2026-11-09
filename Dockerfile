# syntax=docker/dockerfile:1

# ---- Dependencies: installed once and shared by the test and build stages ----
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- Test: lint and unit tests. Only runs with `docker build --target test .` ----
FROM deps AS test
COPY . .
RUN npm run lint && npm test

# ---- Build: type-check and bundle the app into static files in /app/dist ----
FROM deps AS build
COPY . .
RUN npm run build

# ---- Runtime: a small nginx image that only serves the built files ----
FROM nginx:1.28-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q --spider http://127.0.0.1/ || exit 1
