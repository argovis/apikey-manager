FROM node:20.8.0
RUN apt-get update -y

WORKDIR /app
# hack to avoid https://github.com/npm/cli/issues/4838
ENV HOME=/app/npmlogs
RUN mkdir /app/npmlogs && chown -R 1000660000 /app/npmlogs
COPY package.json ./
RUN npm install
COPY . /app
RUN chown -R 1000660000 /app/npmlogs/.npm

CMD [ "npm", "start"]

