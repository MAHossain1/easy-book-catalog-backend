require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// parser
app.use(cors());
app.use(express.json());

// db connection
const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yhkdg66.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
console.log(`db connected successfully`);

const run = async () => {
  try {
    const db = client.db("easy-book-catalog");
    const bookCollection = db.collection("books");

    app.get("/books", async (req, res) => {
      const books = await bookCollection.find({}).toArray();
      res.send({ status: true, data: books });
    });
  } finally {
  }
};

run().catch(err => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello Easy book catalog");
});

app.listen(port, () => {
  console.log(`Book Catalog app listening on port ${port}`);
});
