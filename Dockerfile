FROM node:18.19-alpine
WORKDIR /server
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
RUN npm run build
ENTRYPOINT [ "npm", "run", "start" ]