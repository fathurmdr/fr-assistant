# ---- Stage 1 : Base Node ----
# Used for install dependencies machine level
FROM node:22-alpine AS base
WORKDIR /app

# ---- Stage 2 : Install Dependencies ----
# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp
COPY package.json yarn.lock /temp/
RUN cd /temp && yarn install

# ---- Stage 3 : Prerelease ----
# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/node_modules node_modules
COPY . .

# build nextjs app
RUN yarn build

# ---- Stage 4 : Release ----
# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/node_modules node_modules
COPY --from=prerelease /app/.next .next
COPY --from=prerelease /app/public public
COPY --from=prerelease /app/next.config.ts .
COPY --from=prerelease /app/package.json .

# expose port and define CMD
EXPOSE 3000
CMD [ "yarn", "run", "start" ]