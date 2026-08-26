# ---- Stage 1: build the Angular SPA ----
FROM node:22-alpine AS client-build
WORKDIR /build/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# ---- Stage 2: API server + static assets ----
FROM node:22-alpine
# Keep the server/client sibling layout so the SPA_DIR default still resolves.
COPY server/package*.json /app/server/
WORKDIR /app/server
RUN npm ci

COPY server/ ./
COPY database/ /app/database/
# Generate the Prisma Client for this machine and build a small boot script:
# apply migrations, seed if empty, then start the API.
RUN npx prisma generate
COPY --from=client-build /build/client/dist/social-network/browser /app/client/dist/social-network/browser

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node scripts/seed.js && node index.js"]
