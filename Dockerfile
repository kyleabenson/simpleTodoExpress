FROM node:5.6.0

RUN useradd --user-group --create-home --shell /bin/false kbenson && apt-get

ENV HOME=/home/kbenson

COPY server.js $HOME/app/

COPY package.json $HOME/app/

COPY ./public/ $HOME/app/public

RUN chown -R kbenson:kbenson $HOME/* /usr/local/

WORKDIR $HOME/app

RUN npm cache clean && npm install --silent --progress=false --production

RUN chown -R kbenson:kbenson $HOME/*
USER kbenson

EXPOSE 8080
CMD ["npm", "start"]
