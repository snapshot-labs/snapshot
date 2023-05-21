FROM node:18-alpine

RUN apk update && apk upgrade && \
    apk add --no-cache git py3-pip python3 gcc g++ make

WORKDIR /app

COPY . .

RUN yarn install --frozen-lockfile
RUN yarn install --frozen-lockfile

RUN npm run build

EXPOSE 3002

CMD ["yarn", "run", "dev", "--host"]
