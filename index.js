const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});
app.use(express.json());

// password => yNagn5JnGBwL3rRa
// user = scic

const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ffjkv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // await client.connect();

    const userCollection = client.db("scic").collection("users");
    const taskCollection = client.db("scic").collection("tasks");

    app.post("/tasks", async (req, res) => {
      const task = req.body;
      const result = await taskCollection.insertOne(task);
      res.send(result);
    });
    app.get("/tasks", async (req, res) => {
      const tasks = await taskCollection.find().toArray();
      res.send(tasks);
    });

    app.get("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const task = await taskCollection.findOne(query);
      res.send(task);
    });
    app.delete("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await taskCollection.deleteOne(query);
      res.send(result);
    });
    app.put("/tasks/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const updatedTask = req.body;
    
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ error: "Invalid Task ID" });
        }
    
        const result = await taskCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: updatedTask,
          }
        );
    
        if (result.matchedCount === 0) {
          return res.status(404).json({ error: "Task not found" });
        }
    
        res.json({ message: "Task updated successfully" });
      } catch (error) {
        console.error("Update error:", error);  // Log the error
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
    

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    });
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("scic job task");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
