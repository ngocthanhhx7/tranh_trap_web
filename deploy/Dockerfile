FROM node:22-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json client/package.json
COPY server/package.json server/package.json
RUN npm ci --omit=dev --workspace=server --ignore-scripts --no-audit --no-fund && npm cache clean --force
COPY --chown=node:node server/dist server/dist
COPY --chown=node:node server/scripts/seeds/bootstrap-admin.mjs server/scripts/seeds/bootstrap-admin.mjs
USER node
WORKDIR /app/server
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s CMD node -e "fetch('http://127.0.0.1:4000/api/v1/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "dist/server.js"]
