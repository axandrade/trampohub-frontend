# Estágio 1: build
FROM node:24-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npx ng build --configuration=homolog

# Estágio 2: imagem final (Nginx servindo o build estático)
FROM nginx:1.27-alpine

COPY --from=builder /app/dist/trampohub-frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
