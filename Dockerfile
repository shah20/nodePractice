FROM node:20-alpine

# bash is required for cdk as it used bash to run the commands
RUN apk add --no-cache bash

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 3000

# Either set a anonymouse volumne while running container
# OR add anonymous volume during image building
VOLUME [ "/app/node_modules" ]

CMD ["npm", "run", "start:dev"]