FROM node:12.18.3 as build-stage



WORKDIR /app
COPY ./package.json ./
RUN yarn install
COPY . ./
RUN yarn build

FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/build /usr/share/nginx/html
EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
