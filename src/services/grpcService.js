import {
  loadPackageDefinition,
  Server,
  ServerCredentials,
} from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Database } from '../utils/db.js';
import { ObjectId } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROTO_PATH = join(__dirname, '..', 'proto', 'dynamic.proto');

const packageDefinition = loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const dynamicProto = loadPackageDefinition(packageDefinition).dynamic;

class DynamicService {
  async create(call, callback) {
    try {
      const { collection, data } = call.request;
      const db = Database.getInstance().getDb();
      const result = await db
        .collection(collection)
        .insertOne(JSON.parse(data));

      callback(null, {
        success: true,
        message: 'Created successfully',
        data: JSON.stringify({ id: result.insertedId }),
      });
    } catch (error) {
      callback(null, {
        success: false,
        message: error.message,
      });
    }
  }

  async read(call, callback) {
    try {
      const { collection, id } = call.request;
      const db = Database.getInstance().getDb();
      const result = await db
        .collection(collection)
        .findOne({ _id: new ObjectId(id) });

      if (!result) {
        callback(null, {
          success: false,
          message: 'Document not found',
        });
        return;
      }

      callback(null, {
        success: true,
        message: 'Retrieved successfully',
        data: JSON.stringify(result),
      });
    } catch (error) {
      callback(null, {
        success: false,
        message: error.message,
      });
    }
  }

  async update(call, callback) {
    try {
      const { collection, data, id } = call.request;
      const db = Database.getInstance().getDb();
      const result = await db
        .collection(collection)
        .updateOne({ _id: new ObjectId(id) }, { $set: JSON.parse(data) });

      if (result.matchedCount === 0) {
        callback(null, {
          success: false,
          message: 'Document not found',
        });
        return;
      }

      callback(null, {
        success: true,
        message: 'Updated successfully',
      });
    } catch (error) {
      callback(null, {
        success: false,
        message: error.message,
      });
    }
  }

  async delete(call, callback) {
    try {
      const { collection, id } = call.request;
      const db = Database.getInstance().getDb();
      const result = await db
        .collection(collection)
        .deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        callback(null, {
          success: false,
          message: 'Document not found',
        });
        return;
      }

      callback(null, {
        success: true,
        message: 'Deleted successfully',
      });
    } catch (error) {
      callback(null, {
        success: false,
        message: error.message,
      });
    }
  }

  async list(call, callback) {
    try {
      const { collection, filter } = call.request;
      const db = Database.getInstance().getDb();
      const query = filter ? JSON.parse(filter) : {};
      const results = await db.collection(collection).find(query).toArray();

      callback(null, {
        success: true,
        message: 'Retrieved successfully',
        items: results.map((item) => JSON.stringify(item)),
      });
    } catch (error) {
      callback(null, {
        success: false,
        message: error.message,
        items: [],
      });
    }
  }
}

export function startGrpcServer() {
  const server = new Server();
  server.addService(dynamicProto.DynamicService.service, new DynamicService());

  const port = process.env.GRPC_PORT || 50051;
  server.bindAsync(
    `0.0.0.0:${port}`,
    ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        console.error('Failed to start gRPC server:', error);
        return;
      }
      server.start();
      console.log(`gRPC Server running at 0.0.0.0:${port}`);
    }
  );
}
