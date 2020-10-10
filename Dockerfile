FROM node:12.18.4

COPY ./ ./

# WORKDIR ./user/src/youtube-clone-app

RUN npm install

CMD [ "/bin/bash" ]