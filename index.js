const express = require('express')
const app = express()
const port = process.env.PORT || 5000


const cors = require('cors');
require('dotenv').config()
// middle wares ------------------- 
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_ADMIN}:${process.env.DB_PASSWORD}@cluster0.f4xqs.mongodb.net/?retryWrites=true&w=majority`;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const billCollection = client.db("powerHack").collection("bills");

        app.get('/billing-list', async (req, res) => {
            const query = {}
            const page = parseInt(req.query.page)
            const searched = req.query.searched
            const size = 10;
            const result = await billCollection.find(query).skip(page * 10).limit(size).toArray()
            res.send({ result })
        })
        app.get('/billingCount', async (req, res) => {
            const count = await billCollection.estimatedDocumentCount()
            res.send({ count })
        })



        app.post('/add-billing', async (req, res) => {
            const billing = req.body;
            const result = await billCollection.insertOne(billing)
            res.send(result)
        })
        app.put('/update-billing/:id', async (req, res) => {
            const id = req.params.id;
            const newBill = req.body;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: newBill
            };
            const result = await billCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })

        app.delete('/delete-billing/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await billCollection.deleteOne(query);
            res.send(result);
        })
    } finally {

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Welcome to Power Hacks')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
