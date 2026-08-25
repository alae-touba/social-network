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
RUN cd /app/server && npm ci --omit=dev

COPY server/ /app/server/
COPY --from=client-build /build/client/dist/social-network/browser /app/client/dist/social-network/browser

WORKDIR /app/server
EXPOSE 3000
CMD ["node", "index.js"]
