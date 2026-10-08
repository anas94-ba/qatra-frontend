# Build:  docker build -t qatra-web --build-arg VITE_API_URL=https://api.example.org/api .
# Run:    docker run -p 8080:80 qatra-web
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install --no-audit; fi
COPY . .
# Vite inlines VITE_* variables at build time
ARG VITE_API_URL=http://localhost:4000/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://localhost/healthz || exit 1
