import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 7000; // Changed from BASE_URL to PORT (more standard)

// Middleware
app.use(cors());
app.use(express.json());

import {MongoClient, ObjectId, ServerApiVersion} from 'mongodb';
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
    const reviewCollection = client.db('bistroRestaurant').collection('review');
    const userCollection = client.db('bistroRestaurant').collection('user');
    const cartCollection = client.db('bistroRestaurant').collection('cart');

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

    //* User API
    app.post('/user', async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.get('/user', async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.delete('/user/:id', async (req, res) => {
      const id = req?.params?.id;
      const filter = {_id: new ObjectId(id)};
      const result = await userCollection.deleteOne(filter);
      res.send(result);
    });

    app.patch('/user/:id', async (req, res) => {
      const id = req?.params?.id;
      const filter = {_id: new ObjectId(id)};
      const updatedDoc = {
        $set: {
          role: 'admin',
        },
      };

      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    //* Review API
    app.get('/review', async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    });

    //* Carts API
    app.get('/cart', async (req, res) => {
      const email = req?.query?.email;
      const query = {email: email};
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    });

    app.post('/cart', async (req, res) => {
      const cart = req.body;
      const result = await cartCollection.insertOne(cart);
      res.send(result);
    });

    app.delete('/cart/:id', async (req, res) => {
      const id = req?.params?.id;
      const filter = {_id: new ObjectId(id)};
      const result = await cartCollection.deleteOne(filter);
      res.send(result);
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
