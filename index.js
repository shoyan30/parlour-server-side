const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;

//middleware

app.use(cors());
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.14fjl5a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        await client.connect();

        const servicesCollection = client.db('perlor-bd').collection('services')
        const reviewCollection = client.db('perlor-bd').collection('reviews')
        const usersCollection = client.db('perlor-bd').collection("users");
        const bookingCollection = client.db('perlor-bd').collection("bookingservices");


        app.post ('/users', async(req, res) =>{
            const users = req.body;
            const query = { email: users.email };
            const userVarification = await usersCollection.findOne(query);

            if(userVarification){
                return res.send({Message: "User Already Exist"})

            }
            else{
                const result = await usersCollection.insertOne(users)
                res.send(result)
            }

        })


        app.get('/services', async (req, res) => {
            const result = await servicesCollection.find().toArray()
            res.send(result);
        })

        app.get('/service/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: (id) }
            const result = await servicesCollection.findOne(query)
            res.send(result);
        })

        app.post('/bookingservice', async(req, res) =>{
            const booking = req.body;
            console.log(booking)
            const result = await bookingCollection.insertOne(booking)
            res.send(result)

        })

        app.get('/bookingservice/:email', async (req, res) => {
            try {
                const email = req.params.email;
                console.log("Fetching bookings for email:", email);
        
                if (!email) {
                    return res.status(400).send({ error: "Email parameter is required" });
                }
        
                const query = { email: email };
                const result = await bookingCollection.find(query).toArray();
        
                if (result.length === 0) {
                    return res.status(404).send({ message: "No bookings found for this email" });
                }
        
                res.send(result);
            } catch (error) {
                console.error("Error fetching bookings:", error);
                res.status(500).send({ error: "An error occurred while fetching bookings" });
            }
        });
        

        app.get('/users/:email', async (req, res) => {
            const { email } = req.params; // Get the email from the URL params
            
            try {
              const user = await usersCollection.findOne({ email });
              
              if (!user) {
                return res.status(404).json({ message: 'User not found' });
              }
              
              res.status(200).json(user); // Return the user details
            } catch (error) {
              console.error('Error querying user:', error);
              res.status(500).json({ message: 'Internal server error' });
            }
          });

          app.get('/review', async(req, res) =>{
            const result = await reviewCollection.find().toArray()
            res.send(result)
          })
          
          app.post('/review', async(req, res) =>{
            const review = req.body;
            const result = await reviewCollection.insertOne(review)
            res.send(result)
          })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Perlour server is running')
})

app.listen(port, () => {
    console.log(`Perlour server is running on ${port}`)
})