FROM node:22-alpine

WORKDIR /app
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
COPY package*.json .
RUN npm ci && npm cache clean --force
COPY . .


EXPOSE 5000
CMD ["sh", "-c", "npx prisma generate && npx prisma db seed && node src/index.js"]
