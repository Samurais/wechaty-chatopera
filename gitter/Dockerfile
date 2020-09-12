FROM zixia/wechaty:0.30
MAINTAINER Hai Liang Wang <hain@chatopera.com>

# npm install --registry=https://registry.npm.taobao.org --build-from-source \
#      -g node-gyp wechaty@0.39.40

# Bundle app source
COPY app /app
WORKDIR /app

# Install app dependencies
RUN npm install --production --registry=https://registry.npm.taobao.org 

EXPOSE 8200
CMD [ "npm", "start" ]
