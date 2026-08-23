FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update \
    && apt-get install -y openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 5000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]