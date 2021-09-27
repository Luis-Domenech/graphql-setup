# Node alpine could be installed instead
# Smaller node installation but some npm packages explode using it xD
FROM node:16 as dev

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --production=false
COPY . .

RUN yarn gen
RUN yarn build

FROM node:16 as prod

# Make sure we have access to app directory
RUN mkdir -p /usr/src/app
RUN chown -R node /usr/src/app
WORKDIR /usr/src/app

# Copy important files from dev build and local directory
COPY package.json ./
COPY yarn.lock ./
RUN yarn install --production=true
COPY --from=dev /usr/src/app/dist ./dist
COPY schema.prisma ./
COPY schema.sql ./
COPY .env.production .env
COPY ./scripts/psqlSetup.js ./scripts
COPY ./prisma/schema.sql ./prisma
COPY --from=dev /usr/src/app/migrations ./migrations
RUN chown node migrations

RUN yarn gen

ENV NODE_ENV production

EXPOSE 8080
CMD [ "node", "dist/index.js" ]
USER node