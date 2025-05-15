const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

require('dotenv').config()

const express = require('express');
const cors=require('cors')

const app=express();
const port=process.env.PORT || 5000;

//middleware
app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.iy6spfv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    const teaCollection=client.db('teaDB').collection('tea')

    

    //1. send data to mongoDB
    app.post('/teas', async(req,res)=>{
        
        // get data from client
        const newTea=req.body;
        console.log(newTea);
        
        //send data to mongodb
        const result=await teaCollection.insertOne(newTea)
        res.send(result)
    })

    //2.read data in the server website (http://localhost:5000/teas)

    app.get('/teas', async(req,res)=>{
        const cursor=teaCollection.find();
        const result=await cursor.toArray();
        res.send(result)
    })

    //delete 
    app.delete('/teas/:id', async(req,res)=>{
        const id=req.params.id;
        const query={_id: new ObjectId(id)}
        const result=await teaCollection.deleteOne(query);
        res.send(result)
    })

    //UPDATA THE DATA SPECIFIC,
    //GET THE SPECIFIC DATA IN THE SERVER SIDE
    //http://localhost:5000/teas/6825f91e710b162f9ed9e0ba

    app.get('/teas/:id', async(req,res)=>{
        const id=req.params.id;
        const query={_id: new ObjectId(id)}
        const result=await teaCollection.findOne(query);
        res.send(result)
    })

    //update data from the client site

    app.put('/teas/:id',async(req,res)=>{
        const id=req.params.id;
        const filter={_id: new ObjectId(id)}
        const options={upsert: true};

        const updatedTea=req.body;

        const tea={
            $set:{
                name:updatedTea.name,
                price:updatedTea.price
            }
        }

        const result=await teaCollection.updateOne(filter, tea, options)
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

app.get('/', (req, res)=>{
    res.send('Tea server CRUD is running')
})

app.listen(port, ()=>{
    console.log(`coffee server is running on port: ${port}`);
    
})
