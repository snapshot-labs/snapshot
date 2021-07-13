FROM node:14 as build-stage


WORKDIR /app
COPY ./package.json ./
RUN yarn install
COPY . ./
RUN yarn build

FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
