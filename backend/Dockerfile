FROM denoland/deno:alpine-1.43.6
WORKDIR /app
COPY . .
EXPOSE 8000
CMD ["run", "--allow-net", "--allow-read", "--allow-write", "--allow-env", "app.ts"] 