FROM node:22-alpine

WORKDIR src/app

COPY package*.json .
RUN npm ci && npm cache clean --force
COPY . .
EXPOSE 5000
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node src/index.js"]
