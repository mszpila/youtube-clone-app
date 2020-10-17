FROM node:12.18.4

# Create app directory
WORKDIR /user/src/youtube-clone-app

# Bundle app source
COPY ./ ./

RUN npm install

# CMD [ "/bin/bash" ]
CMD [ "npm", "start" ]