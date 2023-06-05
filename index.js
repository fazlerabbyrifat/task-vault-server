const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const username = process.env.DB_USERNAME;
const password = process.env.DB_USER_PASSWORD;

const uri = `mongodb+srv://${username}:${password}@cluster0.uz4gpo0.mongodb.net/?retryWrites=true&w=majority`;

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
    const tasksCollection = client.db("taskVault").collection("tasks");
    const myTasksCollection = client.db("taskVault").collection("myTasks");

    // all tasks related api
    app.get("/tasks", async (req, res) => {
      const result = await tasksCollection.find().toArray();
      res.send(result);
    });

    app.post('/tasks', async (req, res) => {
      const newTask = req.body;
      const result = await tasksCollection.insertOne(newTask);
      res.send(result);
    })

    // my tasks related api

    app.get("/myTasks", async (req, res) => {
      const result = await myTasksCollection.find().toArray();
      res.send(result);
    });

    app.post("/myTasks", async (req, res) => {
      const task = req.body;
      const result = await myTasksCollection.insertOne(task);
      res.send(result);
    });

    app.delete("/myTasks/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: id };
      const result = await myTasksCollection.deleteOne(query);
      res.send(result);
    });

    app.patch("/myTasks/:id", async (req, res) => {
      const taskId = req.params.id;
      const updatedTask = await myTasksCollection.updateOne(
        { _id: taskId },
        { $set: { completed: true } }
      );

      res.send(updatedTask);
    });
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Task manager is ongoing");
});

app.listen(port, () => {
  console.log(`task manager listening on port ${port}`);
});
