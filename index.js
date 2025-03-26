import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 5000; // Changed from BASE_URL to PORT (more standard)

// Middleware
app.use(cors());
app.use(express.json());

import {MongoClient, ServerApiVersion} from 'mongodb';
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@ecommercedatabase.la5qrjd.mongodb.net/?appName=ecommerceDatabase`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const menuCollection = client.db('bistroRestaurant').collection('menu');

    app.get('/menu', async (req, res) => {
      try {
        const result = await menuCollection.find().toArray();
        if (!result || result.length === 0) {
          return res.status(404).send({message: 'No menu items found'});
        }
        res.send(result);
      } catch (error) {
        console.error('Error fetching menu:', error);
        res.status(500).send({message: 'Internal server error'});
      }
    });

    // Send a ping to confirm a successful connection
    await client.db('admin').command({ping: 1});
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello world');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
