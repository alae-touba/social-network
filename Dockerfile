FROM node:12-alpine3.9

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

EXPOSE 3000

CMD [ "npm", "run", "startdev" ]