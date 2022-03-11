FROM node:14-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN apk update
RUN apk upgrade
RUN apk add ca-certificates && update-ca-certificates
RUN apk add --update tzdata
ENV TZ=Europe/Sofia
RUN rm -rf /var/cache/apk/*
COPY --chown=node . . 

USER node

CMD ["node", "app.js"]
