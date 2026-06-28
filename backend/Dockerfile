FROM node:22-bookworm-slim AS base
WORKDIR /app

FROM base AS dependencies
COPY package.json .npmrc ./
RUN npm install --ignore-scripts

FROM dependencies AS build
COPY tsconfig.json tsconfig.build.json ./
COPY prisma ./prisma
COPY src ./src
RUN npx prisma generate && npm run build

FROM base AS production
ENV NODE_ENV=production
COPY package.json .npmrc ./
RUN npm install --omit=dev --ignore-scripts && npm cache clean --force
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
EXPOSE 4000
CMD ["node", "dist/server.js"]
