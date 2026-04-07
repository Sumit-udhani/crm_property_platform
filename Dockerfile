FROM node:22-alpine

WORKDIR /app

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

COPY package*.json ./
RUN npm ci && npm cache clean --force

COPY prisma ./prisma/


RUN npx prisma generate

COPY . .

EXPOSE 5000


CMD ["node", "src/index.js"]