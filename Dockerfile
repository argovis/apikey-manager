FROM node:17.8.0
RUN apt-get update -y
RUN apt-get install -y zlib1g/stable-security subversion/stable-security openssl/stable-security ldap-utils/stable-security

WORKDIR /app
COPY package.json ./
RUN npm install
COPY . /app
CMD [ "npm", "start"]
