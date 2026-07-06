# Estágio 1: build e testes
FROM node:22-slim AS builder

# Alinha a versão do npm com a usada para gerar o package-lock.json,
# evitando falhas de "npm ci" por resolução de dependências divergente.
RUN npm install -g npm@11

# Instala um binário oficial do Chrome for Testing (com --install-deps resolvendo
# as bibliotecas necessárias). O pacote "chromium" do apt do Debian trava com
# "Trace/breakpoint trap" nesta base de imagem; este binário é o testado/suportado
# pelo próprio ecossistema Puppeteer/Chrome for Testing para uso headless em CI.
RUN apt-get update && apt-get install -y --no-install-recommends unzip ca-certificates \
    && npx --yes @puppeteer/browsers install chrome@stable --path /opt/chrome --install-deps --format '{{path}}' > /opt/chrome-path.txt \
    && ln -s "$(cat /opt/chrome-path.txt)" /usr/local/bin/chrome-for-testing \
    && rm -rf /var/lib/apt/lists/*
ENV CHROME_BIN=/usr/local/bin/chrome-for-testing

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npx ng test --no-watch --no-progress --browsers=ChromeHeadlessNoSandbox --code-coverage

RUN npm run build

# Estágio 2: imagem final, só produção (Nginx servindo o build estático)
FROM nginx:1.27-alpine

COPY --from=builder /app/dist/trampohub-frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
