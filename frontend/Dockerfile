# Stage 1: Build
FROM node:20-alpine as build
WORKDIR /app
COPY frontend/package*.json ./
COPY frontend/tsconfig.json ./
COPY frontend/public ./public
COPY frontend/src ./src
COPY shared ./shared
RUN npm install --legacy-peer-deps && npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 