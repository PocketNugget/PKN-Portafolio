# Stage 1: Build
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY public ./public
COPY src ./src
RUN npm install && npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"] 