FROM node:22-slim
LABEL "language"="nodejs"
LABEL "framework"="express"

WORKDIR /app

COPY backend/ .

RUN npm install

EXPOSE 8080

ENV PORT=8080
ENV NODE_ENV=production

CMD ["npm", "start"]
