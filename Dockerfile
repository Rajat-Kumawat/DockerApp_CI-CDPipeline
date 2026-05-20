FROM node:18-alpine

WORKDIR /app

# Copy package files first (layer caching)
COPY package*.json ./

RUN npm install --production

# Copy rest of the app
COPY . .

EXPOSE 3000

CMD ["node", "app.js"]
