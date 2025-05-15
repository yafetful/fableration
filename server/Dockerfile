FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN mkdir -p ./uploads

EXPOSE 3001

CMD ["npm", "start"] 