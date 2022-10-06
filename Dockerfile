FROM node:14
RUN mkdir -p /opt/base/logs
RUN yarn global add nodemon
WORKDIR /opt/base
COPY . /opt/base
RUN yarn install
COPY . /opt/base