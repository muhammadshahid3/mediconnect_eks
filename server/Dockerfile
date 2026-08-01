FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm install --omit=dev

# Copy application source
COPY . .

# Uploaded doctor profile images are persisted via a volume (see docker-compose.yml)
RUN mkdir -p uploads

EXPOSE 5000

CMD ["node", "server.js"]
