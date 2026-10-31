# Atelier des Astres V0.8 — préproduction sans secrets, branche isolée.
FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-weasyprint fonts-dejavu-core ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY atelier-v08/source.tar.br.base64 /tmp/source.tar.br.base64
RUN node -e "const fs=require('node:fs');const z=require('node:zlib');const src=fs.readFileSync('/tmp/source.tar.br.base64','utf8').trim();fs.writeFileSync('/tmp/source.tar',z.brotliDecompressSync(Buffer.from(src,'base64')));" \
    && tar -xf /tmp/source.tar -C /app \
    && rm -f /tmp/source.tar /tmp/source.tar.br.base64 \
    && chown -R node:node /app
ENV PORT=3000 NODE_ENV=production PYTHON_BIN=python3 \
    ENABLE_STRIPE_TEST=false ENABLE_STRIPE_LIVE=false \
    ASTRO_REPORT_COMPARISON_APPROVED=false PERSISTENT_STORAGE_CONFIRMED=false
USER node
EXPOSE 3000
CMD ["node","src/server.mjs"]
