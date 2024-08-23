const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

// middleware
app.use(cors());
app.use(express.json());
// ------------------------

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rriax4f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Collection
    const ProductsCollection = client
      .db("Merch-Matrix")
      .collection("AllProductsData");
    // await client.connect();

    // Route to get all products data
    app.get("/allProducts", async (req, res) => {
      try {
        const currentPage = parseInt(req.query.page) || 0;
        const size = parseInt(req.query.size) || 10;

        // Get the total number of documents
        const totalProducts = await ProductsCollection.countDocuments();

        // Fetch the paginated data
        const paginationProducts = await ProductsCollection.find()
          .skip(currentPage * size)
          .limit(size)
          .toArray();

        // Fetch all Products in database
        const allProducts = await ProductsCollection.find().toArray();
        // Send both the paginated data and the total number of products
        res.send({
          allProducts,
          totalProducts, // Total number of products (for pagination calculation)
          paginationProducts, // Paginated products for the current page
        });
      } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
      }
    });


    //  Route to get Search data
    app.get("/search/:search", async (req, res) => {
      const searchValue = req.params.search;
      const query = {
        $or: [
          { category: { $regex: searchValue, $options: "i" } },
          { productName: { $regex: searchValue, $options: "i" } },
        ],
      };
      console.log(searchValue);
      const result = await ProductsCollection.find(query).toArray();
      res.send(result);
    });

    // Route to get Category wise products
    app.get("/products/:category", async (req, res) => {
      const category = req.params.category;
      const query = { category: category };
      console.log("category", query);
      const products = await ProductsCollection.find(query).toArray();
      res.send(products);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
