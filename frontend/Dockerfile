# Build stage
FROM node:25-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Run stage
FROM nginx:alpine
COPY --from=build app/dist/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
