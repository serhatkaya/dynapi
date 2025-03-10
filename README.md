# Dynamic API

A flexible and dynamic API that allows you to work with any data structure without predefined schemas. Supports both REST API and gRPC interfaces.

## Features

- Dynamic collection creation and management
- Schema-less data storage
- REST API endpoints
- gRPC service
- MongoDB integration
- Docker support

## Prerequisites

For local development:

- Node.js
- MongoDB
- Protocol Buffers compiler (for gRPC)

For Docker deployment:

- Docker
- Docker Compose

## Installation

### Local Development

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://admin:localpw@localhost:27017/
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
GRPC_PORT=50051
```

4. Start the server:

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

### Docker Deployment

1. Clone the repository

2. Build and start the containers:

```bash
docker-compose up -d
```

This will:

- Build the API service
- Start MongoDB with authentication
- Create a persistent volume for MongoDB data
- Set up a network for service communication
- Configure all environment variables

To stop the services:

```bash
docker-compose down
```

To view logs:

```bash
docker-compose logs -f
```

## REST API Endpoints

### Create a Document

```
POST /api/:collection
Content-Type: application/json

{
  "field1": "value1",
  "field2": "value2"
}
```

### Read a Document

```
GET /api/:collection/:id
```

### List Documents

```
GET /api/:collection
GET /api/:collection?filter={"field":"value"}
```

### Update a Document

```
PUT /api/:collection/:id
Content-Type: application/json

{
  "field1": "new_value"
}
```

### Delete a Document

```
DELETE /api/:collection/:id
```

## gRPC Service

The gRPC service is available on port 50051 (configurable via GRPC_PORT environment variable).

### Available Methods

- Create: Creates a new document in a collection
- Read: Retrieves a document by ID
- Update: Updates an existing document
- Delete: Removes a document
- List: Lists documents in a collection with optional filtering

### Proto Definition

```protobuf
service DynamicService {
  rpc Create (DynamicRequest) returns (DynamicResponse);
  rpc Read (ReadRequest) returns (DynamicResponse);
  rpc Update (DynamicRequest) returns (DynamicResponse);
  rpc Delete (DeleteRequest) returns (DynamicResponse);
  rpc List (ListRequest) returns (ListResponse);
}
```

## Example Usage

### REST API

Create a todo:

```bash
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries", "completed": false}'
```

List todos:

```bash
curl http://localhost:5000/api/todos
```

Filter todos:

```bash
curl http://localhost:5000/api/todos?filter={"title":"Buy groceries"}
```
