import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Database } from './utils/db.js';
import { startGrpcServer } from './services/grpcService.js';
import { ObjectId } from 'mongodb';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/:collection', async (req, res) => {
  try {
    const { collection } = req.params;
    const db = Database.getInstance().getDb();
    const result = await db.collection(collection).insertOne(req.body);
    res.status(201).json({ id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/:collection/:id', async (req, res) => {
  try {
    const { collection, id } = req.params;
    const db = Database.getInstance().getDb();
    const result = await db
      .collection(collection)
      .findOne({ _id: new ObjectId(id) });

    if (!result) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/:collection', async (req, res) => {
  try {
    const { collection } = req.params;
    const query = req.query.filter ? JSON.parse(req.query.filter) : {};
    const db = Database.getInstance().getDb();
    const results = await db.collection(collection).find(query).toArray();
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/:collection/:id', async (req, res) => {
  try {
    const { collection, id } = req.params;
    const db = Database.getInstance().getDb();
    const result = await db
      .collection(collection)
      .updateOne({ _id: new ObjectId(id) }, { $set: req.body });

    if (result.matchedCount === 0) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    res.json({ message: 'Updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/:collection/:id', async (req, res) => {
  try {
    const { collection, id } = req.params;
    const db = Database.getInstance().getDb();
    const result = await db
      .collection(collection)
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start servers
const port = process.env.PORT || 5000;

async function startServers() {
  try {
    await Database.getInstance().connect();

    app.listen(port, () => {
      console.log(`REST API Server running at http://localhost:${port}`);
    });

    startGrpcServer();
  } catch (error) {
    console.error('Failed to start servers:', error);
    process.exit(1);
  }
}

startServers();
