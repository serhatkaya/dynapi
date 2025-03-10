FROM node:20-slim

# Install Protocol Buffers compiler
RUN apt-get update && apt-get install -y protobuf-compiler && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000
EXPOSE 50051

CMD ["npm", "start"] 