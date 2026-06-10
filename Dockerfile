FROM node:25-alpine AS builder

#working directory
WORKDIR /app

COPY package.json package-lock.json ./

# ci = clean install
RUN npm ci

#copy source code 
COPY . .

RUN npm run build


# RUNTIME

FROM node:25-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --only=production

COPY --from=builder /app/.next ./.next

# Copy public files
COPY --from=builder /app/public ./public

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["npm", "start"]



