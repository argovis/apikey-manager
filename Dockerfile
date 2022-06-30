FROM node:17.9.0
RUN apt-get update -y
#RUN apt-get install -y zlib1g/stable-security subversion/stable-security openssl/stable-security ldap-utils/stable-security
RUN npm update -g && npm install -g npm@8.13.2

WORKDIR /app
COPY package.json ./
RUN npm install
COPY . /app
CMD [ "npm", "start"]
