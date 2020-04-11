FROM node:13.12.0-alpine3.10

COPY . /app

WORKDIR /app
RUN npm install

CMD node index.js https://example.com