require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.bu1vbif.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // Mongodb data collections
    const featuresCollection = client.db('assignmentGeniusDB').collection('features');
    const assignmentsCollection = client.db('assignmentGeniusDB').collection('assignments');
    const submittedAssignmentCollection = client.db('assignmentGeniusDB').collection('submittedAssignments')

    // -------------------------------
    // Features related API
    // Read features from the database
    app.get('/features', async(req, res) => {
      const result = await featuresCollection.find().toArray();
      res.send(result);
    })

    // --------------------------------
    // Assignment related API
    // Read the assignments data from the database
    app.get('/assignments', async(req, res) => {
      const sortBy = req.query.sortBy;
      console.log(sortBy)

      let filter = {};
      if(sortBy) {
        filter = {level: sortBy} 
      }
      const result = await assignmentsCollection.find(filter).toArray();
      res.send(result);
    });

    // Read specific data from the database
    app.get('/assignment_details/:id', async(req, res) => {
      const id = req.params.id;
      console.log(id)
      const query = {_id: new ObjectId(id)};
      const result = await assignmentsCollection.findOne(query);
      res.send(result);
    })

    // Create assignment to the database
    app.post('/assignments', async(req, res) => {
      const newAssignment = req.body;
      console.log(newAssignment);
      const result = await assignmentsCollection.insertOne(newAssignment);
      res.send(result);
    });

    // Delete specific assignment from the database
    app.delete('/assignments/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const result = await assignmentsCollection.deleteOne(filter);
      res.send(result);
    });

    // Update specific assignments to the database
    app.put('/assignments/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const options = {upsert: true};
      const assignment = req.body;
      const updatedDoc = {
        $set: {...assignment}
      };
      const result = await assignmentsCollection.updateOne(filter, updatedDoc, options);
      res.send(result);
    });

    // Read the submitted assignments from the database
    app.get('/submittedAssignments', async(req, res) => {
      const result = await submittedAssignmentCollection.find().toArray();
      res.send(result);
    });

    // Create submitted assignment to the database
    app.post('/submittedAssignments', async(req, res) => {
      const submittedAssignment = req.body;
      const result = await submittedAssignmentCollection.insertOne(submittedAssignment);
      res.send(result);
    });



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



// Check server is running 
app.get('/', (req, res) => {
    res.send('Assignment 11 server is running...');
});

// 
app.listen(port, () => {
    console.log(`The server is running on port: ${port}`);
});