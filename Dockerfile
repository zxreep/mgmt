# Build the React frontend
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY client ./client
COPY vite.config.js ./
RUN npm run build

# Run the Express API and serve the built frontend
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY server ./server
COPY inspire_haryana_private_schools.csv ./inspire_haryana_private_schools.csv
COPY --from=build /app/dist ./dist

EXPOSE 5000
USER node
CMD ["npm", "start"]
