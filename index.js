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

    app.patch("/edit-book/:id", async (req, res) => {
      try {
        const bookId = req.params.id;
        const bookData = req.body;

        // Update the book in the database
        const updatedBook = {
          title: bookData.title,
          author: bookData.author,
          genre: bookData.genre,
          publicationDate: bookData.publicationDate,
          userEmail: bookData.userEmail,
        };

        await bookCollection.updateOne(
          { _id: new ObjectId(bookId) },
          { $set: updatedBook }
        );

        res.send({ status: true, message: "Book updated successfully" });
      } catch (error) {
        console.error("Failed to update book", error);
        res
          .status(500)
          .send({ status: false, message: "Failed to update book" });
      }
    });

    app.get("/books", async (req, res) => {
      const books = await bookCollection.find({}).toArray();
      res.send({ status: true, data: books });
    });

    // app.get("/book/:id", async (req, res) => {
    //   const id = req.params.id;

    //   const result = await bookCollection.findOne({ _id: new ObjectId(id) });
    //   res.send(result);
    // });
    app.get("/book/:id", async (req, res) => {
      try {
        const bookId = req.params.id;

        // Fetch the book from the database using the provided ID
        const book = await bookCollection.findOne({
          _id: new ObjectId(bookId),
        });

        if (book) {
          res.json(book);
        } else {
          res.status(404).json({ error: "Book not found" });
        }
      } catch (error) {
        console.error("Failed to fetch book", error);
        res.status(500).json({ error: "Failed to fetch book" });
      }
    });

    app.post("/comment/:id", async (req, res) => {
      const bookId = req.params.id;
      const comment = req.body.comment;
      console.log(comment, bookId);

      console.log(bookId);
      console.log(comment);

      const result = await bookCollection.updateOne(
        { _id: new ObjectId(bookId) },
        { $push: { comments: comment } }
      );

      console.log(result);

      if (result.modifiedCount !== 1) {
        console.error("Book not found or comment not added");
        res.json({ error: "Book not found or comment not added" });
        return;
      }

      console.log("Comment added successfully");
      res.json({ message: "Comment added successfully" });
    });

    app.post("/books", async (req, res) => {
      try {
        const bookData = req.body;
        const userEmail = bookData.userEmail;

        // Add the new book to the database
        const newBook = {
          title: bookData.title,
          author: bookData.author,
          genre: bookData.genre,
          publicationDate: bookData.publicationDate,
          userEmail: userEmail,
        };
        await bookCollection.insertOne(newBook);

        res.send({ status: true, message: "Book added successfully" });
      } catch (error) {
        console.error("Failed to add book", error);
        res.status(500).send({ status: false, message: "Failed to add book" });
      }
    });

    app.get("/comment/:id", async (req, res) => {
      const bookId = req.params.id;

      const result = await bookCollection.findOne(
        { _id: new ObjectId(bookId) },
        { projection: { _id: 0, comments: 1 } }
      );

      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: "Book not found" });
      }
    });

    app.delete("/book/:id", async (req, res) => {
      const bookId = req.params.id;

      try {
        const result = await bookCollection.deleteOne({
          _id: new ObjectId(bookId),
        });

        if (result.deletedCount === 1) {
          res.json({ message: "Book deleted successfully" });
        } else {
          res.status(404).json({ error: "Book not found" });
        }
      } catch (error) {
        console.error("Failed to delete book", error);
        res.status(500).json({ error: "Failed to delete book" });
      }
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
